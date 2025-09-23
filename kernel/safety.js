// /kern/safety.js
const _default = { mode: localStorage.getItem('lh_mode') || 'PG', profanityLevel: +(localStorage.getItem('lh_prof')||25), brandSafeMode: (localStorage.getItem('lh_brand')==='true') };
const softMap = [/fuck/gi,'f**k',/shit/gi,'s**t',/bitch/gi,'b***h',/asshole/gi,'a**hole'];
export const safety = {
  mode: _default.mode,
  profanityLevel: _default.profanityLevel,
  brandSafeMode: _default.brandSafeMode,
  setMode(m){ this.mode=m; localStorage.setItem('lh_mode', m); },
  setProf(n){ this.profanityLevel=n; localStorage.setItem('lh_prof', String(n)); },
  setBrand(b){ this.brandSafeMode=!!b; localStorage.setItem('lh_brand', String(!!b)); },
  formatForOutput(t){
    if (this.mode==='ADULT') return t;
    let out = String(t||'');
    for (let i=0;i<softMap.length;i+=2) out = out.replace(softMap[i], softMap[i+1]);
    return out;
  }
};
