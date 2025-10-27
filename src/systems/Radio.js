/*
Manages the radio iframe player.
- Creates the iframe on first user interaction.
- Provides a simple API to control playback.
- Listens for 'nowplaying' updates.
*/
(function(){

  // Container for the radio player and its display
  const radioContainer = document.createElement('div');
  radioContainer.id = 'radio'; // Uses styles from index.html
  document.body.appendChild(radioContainer);

  const nowPlayingEl = document.createElement('div');
  nowPlayingEl.style.cssText = 'font-size: 12px; opacity: 0.8; padding: 4px 0;';
  nowPlayingEl.textContent = 'Radio Offline';

  const Radio = {
    iframe: null,
    ready: false,
    queue: [],

    init() {
      // Create the iframe on first user interaction to comply with autoplay policies.
      document.body.addEventListener('click', () => this.ensure(), { once: true });
      window.addEventListener('message', (e) => this.onMessage(e));
    },

    ensure() {
      if (this.iframe) return;

      this.iframe = document.createElement('iframe');
      this.iframe.src = window.ULS_CONFIG.RADIO_IFRAME_URL;
      this.iframe.style.cssText = 'width: 280px; height: 60px; border: 0;';

      radioContainer.appendChild(this.iframe);
      radioContainer.appendChild(nowPlayingEl);
      nowPlayingEl.textContent = 'Radio connecting...';
    },

    onMessage(e) {
      if (!e.origin.includes('websim.com')) return;
      const d = e.data || {};
      if (d.source !== 'uls-radio') return;

      if (d.type === 'ready') {
        this.ready = true;
        eventBus.publish('hud.toast', { text: 'Radio Online' });
        this.queue.forEach(cmd => this.post(cmd));
        this.queue = [];
      }
      if (d.type === 'nowplaying') {
        nowPlayingEl.textContent = d.text || '...';
      }
    },

    post(cmd) {
      if (!this.iframe) {
        this.ensure();
      }

      const send = () => {
        if (this.iframe && this.iframe.contentWindow) {
            this.iframe.contentWindow.postMessage({
              target: 'uls-radio',
              cmd: cmd,
            }, '*');
        }
      };

      if (!this.ready) {
        this.queue.push(cmd);
      } else {
        send();
      }
    },

    // --- Public API ---
    play() { this.post('play'); },
    pause() { this.post('pause'); },
    next() { this.post('next'); },
    prev() { this.post('prev'); },
    shuffle() { this.post('shuffle'); },
  };

  Radio.init();

  // Expose for debugging and chat commands
  window.__app.radio = Radio;
})();
