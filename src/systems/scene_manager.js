// src/systems/scene_manager.js
export function createSceneManager() {
  const scenes = new Map();
  let current = null;

  function add(name, factory) { scenes.set(name, factory); }
  function go(name, params) {
    const make = scenes.get(name);
    if (!make) throw new Error(`Unknown scene: ${name}`);
    current = make(params || {});
    current?.enter?.(params || {});
  }
  function update(dt) { current?.update?.(dt); }
  function render(ctx) { current?.render?.(ctx); }
  function getCurrent() { return current; }

  return { add, go, update, render, getCurrent };
}