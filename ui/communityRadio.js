// ui/communityRadio.js - DUAL MODE:
// WebSim iframe mode (default) OR Supabase upload mode (configurable)

import { listStations, uploadTrackToStation } from '../systems/db.js';

// Toggle via RADIO_MODE constant
const RADIO_MODE = 'websim'; // 'websim' or 'supabase'

export function mountCommunityRadio(container, eventBus) {
  if (RADIO_MODE === 'websim') {
    mountWebSimRadio(container, eventBus);
  } else {
    mountSupabaseRadio(container, eventBus);
  }
}

function mountWebSimRadio(container, eventBus) {
  container.innerHTML = `
    <div class="community-radio">
      <h3>Community Radio - WebSim Mode</h3>
      <div class="radio-player">
        <iframe
          id="radio-websim-player"
          src="https://websim.com/@SOFAKINGSADBOI/radio-station"
          width="100%"
          height="400"
          frameborder="0"
          referrerpolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-forms">
        </iframe>
      </div>
      <div class="radio-controls">
        <button id="radio-tune">Tune In</button>
        <button id="radio-email">Email Station</button>
        <button id="radio-schedule">View Schedule</button>
      </div>
    </div>
  `;

  // Event handlers
  container.querySelector('#radio-tune').onclick = function() {
    const iframe = container.querySelector('#radio-websim-player');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'tune_in' }, 'https://websim.com');
    }
  };

  container.querySelector('#radio-email').onclick = function() {
    window.open('mailto:dj@urbansim.radio?subject=Song Request&body=Hey DJ, please play...');
  };

  container.querySelector('#radio-schedule').onclick = function() {
    const iframe = container.querySelector('#radio-websim-player');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'show_schedule' }, 'https://websim.com');
    }
  };
}

function mountSupabaseRadio(container, eventBus) {
  let stations = [];

  container.innerHTML = `
    <div class="community-radio">
      <h3>Community Radio - Upload Mode</h3>
      <div class="stations-list">
        <h4>Radio Stations</h4>
        <div id="stations-container">Loading stations...</div>
      </div>
      <div class="upload-section">
        <h4>Upload Track</h4>
        <select id="station-select">
          <option value="">Select a station...</option>
        </select>
        <input type="text" id="track-title" placeholder="Track title" />
        <input type="text" id="track-artist" placeholder="Artist name" />
        <input type="file" id="track-file" accept="audio/*" />
        <button id="upload-track" disabled>Upload Track</button>
      </div>
      <div class="radio-controls">
        <button id="radio-refresh">Refresh Stations</button>
      </div>
    </div>
  `;

  // Load stations
  async function loadStations() {
    try {
      stations = await listStations();
      const stationsContainer = container.querySelector('#stations-container');
      const stationSelect = container.querySelector('#station-select');

      if (stations.length === 0) {
        stationsContainer.innerHTML = '<p>No stations available</p>';
        return;
      }

      stationsContainer.innerHTML = stations.map(s =>
        `<div class="station-item">
          <strong>${s.name}</strong>
          <small>${s.genre ? ` - ${s.genre}` : ''}</small>
        </div>`
      ).join('');

      stationSelect.innerHTML = '<option value="">Select a station...</option>' +
        stations.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

    } catch (error) {
      console.error('Failed to load stations:', error);
      container.querySelector('#stations-container').innerHTML = '<p>Failed to load stations</p>';
    }
  }

  // Upload validation
  function validateUpload() {
    const stationId = container.querySelector('#station-select').value;
    const title = container.querySelector('#track-title').value.trim();
    const artist = container.querySelector('#track-artist').value.trim();
    const file = container.querySelector('#track-file').files[0];

    const uploadBtn = container.querySelector('#upload-track');
    uploadBtn.disabled = !(stationId && title && artist && file);
  }

  // Event handlers
  container.querySelector('#station-select').onchange = validateUpload;
  container.querySelector('#track-title').oninput = validateUpload;
  container.querySelector('#track-artist').oninput = validateUpload;
  container.querySelector('#track-file').onchange = validateUpload;

  container.querySelector('#upload-track').onclick = async () => {
    const stationId = container.querySelector('#station-select').value;
    const title = container.querySelector('#track-title').value.trim();
    const artist = container.querySelector('#track-artist').value.trim();
    const file = container.querySelector('#track-file').files[0];

    if (!stationId || !title || !artist || !file) {
      alert('Please fill all fields and select a file');
      return;
    }

    try {
      container.querySelector('#upload-track').disabled = true;
      container.querySelector('#upload-track').textContent = 'Uploading...';

      const result = await uploadTrackToStation({ stationId, title, artist, file });

      alert(`Track "${title}" uploaded successfully!`);

      // Reset form
      container.querySelector('#track-title').value = '';
      container.querySelector('#track-artist').value = '';
      container.querySelector('#track-file').value = '';
      container.querySelector('#station-select').value = '';

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      container.querySelector('#upload-track').disabled = false;
      container.querySelector('#upload-track').textContent = 'Upload Track';
      validateUpload();
    }
  };

  container.querySelector('#radio-refresh').onclick = loadStations;

  // Initial load
  loadStations();
}

export function getRadioStations() {
  if (RADIO_MODE === 'supabase') {
    return listStations();
  }
  // WebSim mode fallback
  return [
    { id: 1, name: "District Beats", frequency: "101.5", genre: "electronic" },
    { id: 2, name: "Street Stories", frequency: "96.3", genre: "talk" },
    { id: 3, name: "Underground FM", frequency: "88.1", genre: "alternative" }
  ];
}

export function broadcastToRadio(content) {
  console.log('Broadcasting to radio:', content);
  return { success: true, broadcastId: Date.now() };
}