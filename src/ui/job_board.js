/**
 * @file src/ui/job_board.js
 * @description Manages the job board UI.
 */
import { eventBus } from '../systems/bus.js';

class JobBoard {
  constructor() {
    window.openJobs = () => this.open(); // Maintain backward compatibility
  }

  open() {
    const w = document.createElement('div');
    w.id = 'jobs';
    w.style.cssText = 'position:fixed;inset:10%;background:#0b0b0b;color:#fff;border:1px solid #333;border-radius:10px;z-index:99999;padding:12px';
    w.innerHTML = `
      <h3>Job Board</h3>
      <p>Pick up quick gigs for cash.</p>
      <button id="job-uber">Rideshare ($20–$60)</button>
      <button id="job-dnd">DND Tournament (big prize)</button>
      <div style="margin-top:10px"><button onclick="document.getElementById('jobs').remove()">Close</button></div>`;
    document.body.appendChild(w);
    document.getElementById('job-uber').onclick = () => { eventBus.publish('job.uber.start'); w.remove(); };
    document.getElementById('job-dnd').onclick = () => { eventBus.publish('job.dnd.start'); w.remove(); };
  }
}

export const jobBoard = new JobBoard();
