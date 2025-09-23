// /kern/imageGen.js
const STYLES = {
  uls: "street-level, cinematic neon, slight film grain, 35mm",
  "living-hell": "reality TV handheld, harsh LED, candid interior",
  dreamworld: "surreal nocturne, pastel neon haze, symbolic motifs"
};
export const imageGen = {
  async request({realm='uls', prompt='', seed=null}={}){
    const style = STYLES[realm] || STYLES.uls;
    const full = `[${realm}] ${style}. ${prompt}`.slice(0, 400);
    // Hook to WebSim/your image endpoint; placeholder returns a data URL or placeholder PNG.
    return `https://via.placeholder.com/960x540.png?text=${encodeURIComponent(realm)}`;
  }
};
