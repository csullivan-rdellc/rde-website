import { queryItems } from '/js/wix/items.js';
const page = document.body.dataset.cmsPage;
function safeUrl(value, protocols = ['https:','mailto:','tel:']) {
 if(typeof value !== 'string' || !value.trim()) return null;
 try { const url = new URL(value,location.href); return protocols.includes(url.protocol) ? url.href : null; } catch { return null; }
}
async function loadPageContent() {
 try {
  const allItems=[];
  for(let skip=0;;skip+=100){
   const result=await queryItems('RDEPageContent',{filters:[{field:'page',op:'eq',value:page}],limit:100,skip});
   allItems.push(...result.items);
   if(!result.hasNext)break;
  }
  const items = new Map(allItems.map(item=>[item.key,item]));
  document.querySelectorAll('[data-cms-text]').forEach(el=>{
   const bindings=JSON.parse(el.dataset.cmsText);
   for(const [index,key] of Object.entries(bindings)){
    const item=items.get(key), node=el.childNodes[Number(index)];
    if(item && typeof item.text==='string' && node?.nodeType===Node.TEXT_NODE){
     const before=node.textContent;
     node.textContent=(before.match(/^\s*/)?.[0]||'')+item.text+(before.match(/\s*$/)?.[0]||'');
    }
   }
  });
  document.querySelectorAll('[data-cms-link]').forEach(el=>{
   const item=items.get(el.dataset.cmsLink),url=safeUrl(item?.link);
   if(url)el.href=url;
  });
  document.querySelectorAll('[data-cms-image]').forEach(el=>{
   const item=items.get(el.dataset.cmsImage),src=safeUrl(item?.image,['https:']);
   if(src && el.src!==src)el.src=src;
   if(typeof item?.imageAlt==='string')el.alt=item.imageAlt;
  });
  document.querySelectorAll('[data-cms-video]').forEach(el=>{
   const item=items.get(el.dataset.cmsVideo);
   const poster=safeUrl(item?.image,['https:']);
   if(poster)el.poster=poster;
   const source=el.querySelector('source'),src=safeUrl(item?.videoUrl,['https:']);
   if(source && src && source.src!==src){source.src=src;el.load();}
   if(typeof item?.imageAlt==='string' && item.imageAlt)el.setAttribute('aria-label',item.imageAlt);
  });
  document.documentElement.dataset.cmsState='loaded';
  document.dispatchEvent(new CustomEvent('rde:cms-ready'));
 } catch(error) {
  document.documentElement.dataset.cmsState='fallback';
  console.warn('Page content is temporarily unavailable; showing the published copy.',error);
 }
}
loadPageContent();
