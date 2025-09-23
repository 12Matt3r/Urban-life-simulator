// systems/careerLog.js
import { eventBus } from './eventBus.js';

const _log = []; // [{ts:number, kind:'role'|'district', detail:string, tags?:string[] }]

export function entries() { return _log.slice(); }

export function add(kind, detail, tags = []) {
  _log.push({ ts: Date.now(), kind, detail, tags: Array.isArray(tags) ? tags.slice(0, 12) : [] });
  eventBus.publish('career.log.updated', entries());
}

export function clear() {
  _log.length = 0;
  eventBus.publish('career.log.updated', entries());
}

export function exportMarkdown(characterName) {
  if (characterName === void 0) { characterName = 'Player'; }
  const lines = ['# ' + characterName + ' — Career Log', ''];
  for (const e of _log) {
    const when = new Date(e.ts).toLocaleString();
    const tagStr = (e.tags && e.tags.length) ? '  _[' + e.tags.join(', ') + ']_' : '';
    lines.push('- **' + when + '** — ' + (e.kind === 'role' ? 'Role' : 'District') + ': ' + e.detail + tagStr);
  }
  return lines.join('\n');
}

// Auto-subscribe: record role and district changes
eventBus.subscribe('career.tags.updated', (tags = []) => {
  if (!tags.length) return;
  add('role', `Roles updated`, tags);
});

eventBus.subscribe('district.changed', (name) => {
  if (!name) return;
  add('district', `Moved to ${name}`);
});