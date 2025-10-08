// src/systems/audio.js
export function createAudio(opts = {}) {
  const Ctor = window.AudioContext || window.webkitAudioContext;
  const ctx = opts.audioContext || new Ctor();
  const buffers = new Map();
  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  async function load(name, url) {
    const res = await fetch(url);
    const buf = await ctx.decodeAudioData(await res.arrayBuffer());
    buffers.set(name, buf);
  }

  function play(name) {
    const buf = buffers.get(name);
    if (!buf) throw new Error(`Audio not loaded: ${name}`);
    const node = ctx.createBufferSource();
    node.buffer = buf;
    node.connect(gain);
    node.start();
    return node;
  }

  function setVolume(v) { gain.gain.value = v; }
  async function resume() { if (ctx.state !== 'running') await ctx.resume(); }

  return { ctx, load, play, setVolume, resume };
}