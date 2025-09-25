// /kernel/eventBus.js
export const eventBus = (()=>{const m={};return{
  publish:(t,p)=> (m[t]||[]).forEach(f=>f(p)),
  subscribe:(t,f)=>(m[t]=(m[t]||[]).concat(f),()=>m[t]=m[t].filter(x=>x!==f))
}})();