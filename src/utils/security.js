import { ULS_CONFIG } from '../config.js';

export function validateOrigin(origin) {
  return ULS_CONFIG.SECURITY.ALLOWED_ORIGINS.includes(origin);
}

export function securePostMessage(targetWindow, message, targetOrigin = ULS_CONFIG.WEBSIM_ORIGIN) {
  if (!targetWindow) {
    console.error('Target window is null or undefined');
    return false;
  }

  if (!validateOrigin(targetOrigin)) {
    console.error(`Attempted to post message to untrusted origin: ${targetOrigin}`);
    return false;
  }

  try {
    targetWindow.postMessage(message, targetOrigin);
    return true;
  } catch (err) {
    console.error('Failed to post message:', err);
    return false;
  }
}

export function createSecureMessageListener(allowedOrigins, handlers) {
  return (event) => {
    if (!allowedOrigins.includes(event.origin)) {
      console.warn(`Blocked message from untrusted origin: ${event.origin}`);
      return;
    }

    const { type, data } = event.data;

    if (handlers[type]) {
      try {
        handlers[type](data, event);
      } catch (err) {
        console.error(`Error handling message type ${type}:`, err);
      }
    }
  };
}

export function sanitizeHTML(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

export function sanitizeURL(url) {
  try {
    const parsed = new URL(url);

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('Invalid protocol');
    }

    return parsed.href;
  } catch (err) {
    console.error('Invalid URL:', url);
    return null;
  }
}

let lastImageRequest = 0;

export function throttleImageRequest() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastImageRequest;

  if (timeSinceLastRequest < ULS_CONFIG.SECURITY.IMAGE_THROTTLE_MS) {
    const waitTime = ULS_CONFIG.SECURITY.IMAGE_THROTTLE_MS - timeSinceLastRequest;
    return {
      allowed: false,
      waitTime,
      message: `Image requests are throttled. Please wait ${Math.ceil(waitTime / 1000)} seconds.`
    };
  }

  lastImageRequest = now;

  return {
    allowed: true,
    waitTime: 0
  };
}

export function resetImageThrottle() {
  lastImageRequest = 0;
}
