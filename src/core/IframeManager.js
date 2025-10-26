import { ULS_CONFIG } from '../config.js';

class IframeManager {
  constructor() {
    this.iframes = new Map();
    this.pendingHandshakes = new Map();
    this.messageHandlers = new Map();
    this.setupMessageListener();
  }

  setupMessageListener() {
    window.addEventListener('message', (event) => {
      if (!this.isOriginAllowed(event.origin)) {
        console.warn(`Blocked message from untrusted origin: ${event.origin}`);
        return;
      }

      this.handleMessage(event);
    });
  }

  isOriginAllowed(origin) {
    return ULS_CONFIG.SECURITY.ALLOWED_ORIGINS.includes(origin);
  }

  loadModule(name, url, container) {
    return new Promise((resolve, reject) => {
      if (this.iframes.has(name)) {
        resolve(this.iframes.get(name));
        return;
      }

      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.setAttribute('data-module', name);
      iframe.style.border = 'none';
      iframe.style.width = '100%';
      iframe.style.height = '100%';

      iframe.addEventListener('load', () => {
        this.iframes.set(name, iframe);

        this.pendingHandshakes.set(name, {
          resolve,
          reject,
          timeout: setTimeout(() => {
            reject(new Error(`Handshake timeout for module: ${name}`));
            this.pendingHandshakes.delete(name);
          }, 10000)
        });

        this.sendToModule(name, { cmd: 'handshake', source: 'uls' });
      });

      iframe.addEventListener('error', () => {
        reject(new Error(`Failed to load module: ${name}`));
        this.iframes.delete(name);
      });

      if (container) {
        container.appendChild(iframe);
      }
    });
  }

  handleMessage(event) {
    const { target, cmd, data } = event.data;

    if (cmd === 'handshake_ack' && this.pendingHandshakes.has(target)) {
      const handshake = this.pendingHandshakes.get(target);
      clearTimeout(handshake.timeout);
      handshake.resolve(this.iframes.get(target));
      this.pendingHandshakes.delete(target);
      return;
    }

    const handlers = this.messageHandlers.get(target);

    if (handlers && handlers.has(cmd)) {
      const handler = handlers.get(cmd);
      try {
        handler(data, event);
      } catch (err) {
        console.error(`Error in message handler for ${target}.${cmd}:`, err);
      }
    }
  }

  sendToModule(moduleName, message) {
    const iframe = this.iframes.get(moduleName);

    if (!iframe) {
      console.warn(`Module ${moduleName} not loaded`);
      return false;
    }

    try {
      iframe.contentWindow.postMessage(message, ULS_CONFIG.WEBSIM_ORIGIN);
      return true;
    } catch (err) {
      console.error(`Failed to send message to ${moduleName}:`, err);
      return false;
    }
  }

  registerHandler(moduleName, command, handler) {
    if (!this.messageHandlers.has(moduleName)) {
      this.messageHandlers.set(moduleName, new Map());
    }

    this.messageHandlers.get(moduleName).set(command, handler);
  }

  unregisterHandler(moduleName, command) {
    const handlers = this.messageHandlers.get(moduleName);

    if (handlers) {
      handlers.delete(command);
    }
  }

  unloadModule(moduleName) {
    const iframe = this.iframes.get(moduleName);

    if (iframe && iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }

    this.iframes.delete(moduleName);
    this.messageHandlers.delete(moduleName);

    if (this.pendingHandshakes.has(moduleName)) {
      const handshake = this.pendingHandshakes.get(moduleName);
      clearTimeout(handshake.timeout);
      handshake.reject(new Error(`Module ${moduleName} unloaded before handshake`));
      this.pendingHandshakes.delete(moduleName);
    }
  }

  isModuleLoaded(moduleName) {
    return this.iframes.has(moduleName);
  }

  getModule(moduleName) {
    return this.iframes.get(moduleName);
  }

  unloadAll() {
    const moduleNames = Array.from(this.iframes.keys());
    moduleNames.forEach(name => this.unloadModule(name));
  }
}

export const iframeManager = new IframeManager();

export function loadWebSimModule(moduleName, container) {
  const url = ULS_CONFIG.WEBSIM_MODULES[moduleName];

  if (!url) {
    return Promise.reject(new Error(`Unknown module: ${moduleName}`));
  }

  return iframeManager.loadModule(moduleName, url, container);
}

export function sendToWebSimModule(moduleName, message) {
  return iframeManager.sendToModule(moduleName, message);
}

export function registerWebSimHandler(moduleName, command, handler) {
  iframeManager.registerHandler(moduleName, command, handler);
}

export function unloadWebSimModule(moduleName) {
  iframeManager.unloadModule(moduleName);
}
