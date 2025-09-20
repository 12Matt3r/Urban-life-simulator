function mulberry32(seed){
  let t = seed>>>0;
  return function(){
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ t>>>15, 1|t);
    r ^= r + Math.imul(r ^ r>>>7, 61|r);
    return ((r ^ r>>>14)>>>0) / 4294967296;
  };
}
export function createRNG(seed){
  const rand = mulberry32(seed||1);
  return {
    seed,
    random:()=>rand(),
    pick:arr=>arr[Math.floor(rand()*arr.length)],
    shuffle:(arr)=>{
      const a=arr.slice();
      for(let i=a.length-1;i>0;i--){
        const j=Math.floor(rand()*(i+1));
        [a[i],a[j]]=[a[j],a[i]];
      }
      return a;
    }
  };
}