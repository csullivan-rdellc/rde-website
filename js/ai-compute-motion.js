import { assuranceDiagram } from '/js/assurance-diagram.js';
const SESSION_KEY='rde-ai-assurance-played-v1';
export function createAssuranceVisual(){
 const wrap=document.createElement('div');wrap.className='ai-assurance-visual';wrap.dataset.aiAssurance='';wrap.innerHTML=assuranceDiagram();
 const replay=document.createElement('button');replay.type='button';replay.className='replay-sequence';replay.textContent='Replay sequence';replay.hidden=true;wrap.after(replay);
 let modulePromise,timeline,requested=false;
 const finalFrame=()=>{wrap.querySelectorAll('.assurance-path').forEach(path=>{path.style.strokeDasharray='';path.style.strokeDashoffset=''});wrap.querySelectorAll('.assurance-node,.assurance-branch,.assurance-marker').forEach(node=>{node.style.opacity='1';node.style.transform=''})};
 const hasPlayed=()=>{try{return sessionStorage.getItem(SESSION_KEY)==='1'}catch{return false}};
 const remember=()=>{try{sessionStorage.setItem(SESSION_KEY,'1')}catch{}}
 const load=()=>modulePromise||(modulePromise=import('/vendor/anime-4.5.0/anime.esm.min.js'));
 async function play(force=false){requested=true;if(!force&&hasPlayed()){finalFrame();replay.hidden=false;return}try{const {createTimeline,stagger}=await load();if(!requested&&!force)return;timeline?.pause();const paths=[...wrap.querySelectorAll('.assurance-path')];paths.forEach(path=>{const length=path.getTotalLength();path.style.strokeDasharray=String(length);path.style.strokeDashoffset=String(length)});const nodes=wrap.querySelectorAll('.assurance-node,.assurance-branch');const marker=wrap.querySelector('.assurance-marker');nodes.forEach(node=>{node.style.opacity='0';node.style.transform='scale(.97)'});marker.style.opacity='0';marker.style.transform='scale(.97)';replay.hidden=true;timeline=createTimeline({autoplay:false,defaults:{ease:'out(4)'}}).add(nodes,{opacity:[0,1],scale:[.97,1],duration:700,delay:stagger(80)},0).add(paths,{strokeDashoffset:0,duration:700,delay:stagger(80)},700).add(marker,{opacity:[0,1],scale:[.97,1],duration:700},1400);timeline.then(()=>{remember();replay.hidden=false;finalFrame()});timeline.play()}catch(error){console.warn('AI assurance motion unavailable.',error);finalFrame();replay.hidden=true}}
 wrap.addEventListener('rde:ai-preload',()=>{load().catch(()=>finalFrame())});
 wrap.addEventListener('rde:ai-play',()=>play(false));
 wrap.addEventListener('rde:ai-reduced',()=>{finalFrame();replay.hidden=true});
 replay.addEventListener('click',()=>play(true));
 addEventListener('pagehide',()=>timeline?.pause(),{once:true});
 return {wrap,replay};
}
