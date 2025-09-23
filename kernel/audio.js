// /kern/audio.js
const bgm = new Audio(); bgm.loop=true; bgm.preload='auto';
const radio = new Audio(); radio.preload='none';
let audioEnabled = false;
export const audio = {
  ensure(){ if (!audioEnabled) { bgm.muted=false; radio.muted=false; audioEnabled=true; } },
  playBGM(src, vol=0.5){ this.ensure(); try{ if(bgm.src!==src) bgm.src=src; bgm.volume=vol; bgm.play(); }catch(_){} },
  stopBGM(){ try{ bgm.pause(); }catch(_){} },
  playRadio(src, vol=0.8){ this.ensure(); try{ radio.src=src; radio.volume=vol; radio.play(); }catch(_){} },
  stopRadio(){ try{ radio.pause(); }catch(_){} }
};
