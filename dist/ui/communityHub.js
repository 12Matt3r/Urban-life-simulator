import { mountStorylines } from './communityStorylines.js';
import { mountCommunityRadio } from './communityRadio.js';

let hubEl, contentEl, closeBtn, tabs;

function bind(){
  hubEl = document.getElementById('community-hub');
  contentEl = document.getElementById('community-content');
  closeBtn = document.getElementById('community-close');
  tabs = hubEl.querySelectorAll('.tabs button');

  closeBtn.onclick = () => { hubEl.hidden = true; contentEl.innerHTML=''; };
  tabs.forEach(btn => btn.onclick = () => renderTab(btn.dataset.tab));
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && !hubEl.hidden) { hubEl.hidden=true; }});
}

function renderTab(tab){
  tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  contentEl.innerHTML = '';
  if (tab === 'storylines') mountStorylines(contentEl);
  if (tab === 'radio') mountCommunityRadio(contentEl);
}

export function openCommunityHub(defaultTab='storylines'){
  if (!hubEl) bind();
  hubEl.hidden = false;
  renderTab(defaultTab);
}