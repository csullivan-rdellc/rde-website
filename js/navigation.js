const menu=document.querySelector('.menu-button'),nav=document.querySelector('#main-nav'),drop=document.querySelector('.services-menu');
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');nav.classList.toggle('open',open);});
document.addEventListener('click',event=>{if(drop&&!drop.contains(event.target))drop.open=false;});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&drop?.open){drop.open=false;drop.querySelector('summary').focus();}});
nav?.addEventListener('click',event=>{if(event.target.closest('a')&&menu){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');if(drop)drop.open=false;}});
