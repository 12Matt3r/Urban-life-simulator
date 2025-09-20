class EventBus {
  constructor(){ this.listeners = {}; }
  subscribe(topic, cb){ (this.listeners[topic] ||= []).push(cb); }
  publish(topic, payload){
    (this.listeners[topic]||[]).forEach(fn=>{
      try{ fn(payload); }catch(e){ console.error(`Error in '${topic}' subscriber:`, e); }
    });
  }
}
export const eventBus = new EventBus();