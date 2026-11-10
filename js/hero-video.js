// Global video policy: muted autoplay, inline looping, no visible playback/download controls.
const registered=new WeakSet();
const clips=[...document.querySelectorAll('.hero-film')];
let active=Math.max(0,clips.findIndex(clip=>clip.classList.contains('is-active')));
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const attemptPlay=video=>{if(video.hasAttribute('data-motion-alternative')&&reduced.matches){video.pause();return;}if(!document.hidden)video.play()?.catch(()=>{});};
reduced.addEventListener('change',()=>document.querySelectorAll('[data-motion-alternative]').forEach(video=>{if(reduced.matches)video.pause();else attemptPlay(video);}));
function configure(video){
 video.autoplay=true;video.loop=true;video.muted=true;video.defaultMuted=true;video.playsInline=true;video.controls=false;
 for(const attr of ['autoplay','loop','muted','playsinline','disablepictureinpicture','disableremoteplayback'])video.setAttribute(attr,'');
 video.removeAttribute('controls');video.setAttribute('controlslist','nodownload noremoteplayback nofullscreen');video.disablePictureInPicture=true;video.disableRemotePlayback=true;
 if(registered.has(video))return;
 registered.add(video);
 video.addEventListener('contextmenu',event=>event.preventDefault());
 video.addEventListener('dragstart',event=>event.preventDefault());
 const play=()=>{const index=clips.indexOf(video);if(index<0||index===active)attemptPlay(video);else video.pause();};
 video.addEventListener('loadeddata',play);
 video.addEventListener('loadedmetadata',play);
 if(clips.includes(video)&&clips.length>1){
  video.addEventListener('timeupdate',()=>{
   if(clips[active]!==video||!Number.isFinite(video.duration)||video.duration-video.currentTime>.18)return;
   video.pause();video.classList.remove('is-active');active=(active+1)%clips.length;
   const next=clips[active];next.currentTime=0;next.classList.add('is-active');attemptPlay(next);
  });
 }
 play();
}
function apply(root=document){if(root.matches?.('video'))configure(root);root.querySelectorAll?.('video').forEach(configure);root.querySelectorAll?.('.hero-motion').forEach(button=>button.remove());}
apply();
new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1)apply(node);}).observe(document.body,{childList:true,subtree:true});
document.addEventListener('rde:cms-ready',()=>apply());
document.addEventListener('visibilitychange',()=>document.querySelectorAll('video').forEach(video=>{if(document.hidden)video.pause();else if(!clips.includes(video)||clips[active]===video)attemptPlay(video);}));
