// /realms/uls/loop.js
// Minimal, deterministic stub you can later replace with LLM/WebSim logic.
export function createEngine({ safety, TimeSystem, WeatherSystem }){
  return {
    async next(ctx){
      // craft a small event using context
      const t = TimeSystem.get();
      const w = WeatherSystem.get();
      const base = `It is ${t.label} in ${w.label}. ${ctx.character.district} feels on edge.`;

      // simple branching
      let title = 'Street Corner';
      let desc  = `${base} You notice a food cart and a shady alley nearby.`;
      let changes = null;

      const txt = (ctx.actionText||'').toLowerCase();
      if (txt.includes('food')){
        title = 'Quick Bite';
        desc  = `The vendor slides a foil wrap your way. Energy returns, but your wallet feels lighter.`;
        changes = { money: -10, health: +5, reputation: +1 };
      } else if (txt.includes('alley') || txt.includes('shady')){
        title = 'Shakedown';
        desc  = `Two figures close in. You posture up and they back off—barely. Heat rises.`;
        changes = { heat: +5, reputation: +1 };
      }

      return {
        title,
        description: safety.formatForOutput(desc),
        statChanges: changes,
        decisions: [
          { text:'Head to the market' },
          { text:'Explore the alley' },
          { text:'Look for work' }
        ]
      };
    }
  };
}
