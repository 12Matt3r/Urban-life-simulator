/*
Manages the radio iframe.
*/
const Radio = {
  iframe: null,

  init() {
    this.createIframe();
    // Optional: Listen for messages back from the radio if needed
    // window.addEventListener('message', (e) => this.onMessage(e));
  },

  createIframe() {
    this.iframe = document.createElement('iframe');
    this.iframe.src = 'https://websim.com/radio'; // As per the spec
    this.iframe.style.display = 'none';
    document.body.appendChild(this.iframe);
  },

  post(action, payload) {
    if (!this.iframe) return;
    this.iframe.contentWindow.postMessage({
      from: 'uls',
      type: 'radio',
      action: action,
      payload: payload,
    }, '*');
  },

  // --- Public API ---
  play() {
    this.post('play');
  },

  pause() {
    this.post('pause');
  },

  setStation(stationId) {
    this.post('setStation', { stationId });
  },

  setVolume(volume) {
    this.post('setVolume', { volume });
  }
};

Radio.init();
window.global.radio = Radio;