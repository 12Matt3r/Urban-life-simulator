/**
 * @file src/utils/security.js
 * @description Security utilities for origin validation and sanitization.
 */

import { ULS_CONFIG } from '../config.js';

const ALLOWED_ORIGINS = Object.values(ULS_CONFIG)
  .filter(url => typeof url === 'string' && url.startsWith('http'))
  .map(url => new URL(url).origin);

export const security = {
  isValidOrigin(origin) {
    return ALLOWED_ORIGINS.includes(origin);
  },

  sanitize(text) {
    const element = document.createElement('div');
    element.innerText = text;
    return element.innerHTML;
  }
};
