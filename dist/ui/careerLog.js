// ui/careerLog.js
import { entries, clear, exportMarkdown } from '../systems/careerLog.js';
import { eventBus } from '../systems/eventBus.js';

let root;

export function mountCareerLogModal(containerId = 'career-log-modal') {
  const existing = document.getElementById(containerId);
  if (existing) { root = existing; return; }

  const html = `
    <div id="${containerId}" class="modal-overlay" hidden>
      <div class="modal-content" style="gap:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h2>Career Log</h2>
          <div style="display:flex; gap:8px;">
            <button id="cl-export">Export</button>
            <button id="cl-clear">Clear</button>
            <button id="cl-close">X</button>
          </div>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <label>Filter</label>
          <select id="cl-filter">
            <option value="all">All</option>
            <option value="role">Role</option>
            <option value="district">District</option>
          </select>
        </div>
        <div id="cl-list" style="flex:1; overflow:auto; border:1px solid #3a3a5e; border-radius:8px; padding:10px;"></div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  root = document.getElementById(containerId);

  const closeBtn = root.querySelector('#cl-close');
  const clearBtn = root.querySelector('#cl-clear');
  const exportBtn = root.querySelector('#cl-export');
  const filterSel = root.querySelector('#cl-filter');
  const listEl = root.querySelector('#cl-list');

  function render() {
    const filter = filterSel.value;
    const data = entries().filter(e => filter === 'all' ? true : e.kind === filter);
    if (!data.length) { listEl.innerHTML = `<p class="muted">No entries yet.</p>`; return; }
    listEl.innerHTML = data.map(e => {
      const when = new Date(e.ts).toLocaleString();
      const tagStr = e.tags?.length ? `<span class="muted"> [${e.tags.join(', ')}]</span>` : '';
      return `<div style="margin-bottom:8px;">
        <strong>${when}</strong> — ${e.kind === 'role' ? 'Role' : 'District'}: ${escapeHtml(e.detail)} ${tagStr}
      </div>`;
    }).join('');
  }

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  closeBtn.onclick = () => { root.hidden = true; };
  clearBtn.onclick = () => { if (confirm('Clear career log?')) { clear(); } };
  exportBtn.onclick = () => {
    const md = exportMarkdown(window?.Life?.state?.name?.() || 'Player');
    const blob = new Blob([md], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `career_log_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  };
  filterSel.onchange = render;

  eventBus.subscribe('career.log.updated', render);
  render();
}

export function openCareerLogModal() {
  if (!root) mountCareerLogModal();
  root.hidden = false;
  // trigger render once opened (in case of stale)
  document.getElementById('cl-filter')?.dispatchEvent(new Event('change'));
}