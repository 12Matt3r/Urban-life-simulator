// ui/radio.js
var Radio = {
    modalElement: null,
    closeButton: null,
    enableAudioButton: null,
    audioGateElement: null,
    radioPlayerElement: null,
    stationListElement: null,
    nowPlayingElement: null,

    audioContext: null,
    audioElement: null,

    stations: [
        { name: 'Lo-Fi Beats', type: 'direct', url: 'https://placehold.co/audio/lofi.mp3' }, // Placeholder
        { name: 'Hip-Hop Classics', type: 'youtube', url: 'https://www.youtube.com/results?search_query=hip+hop+classics' },
        { name: 'Vaporwave', type: 'soundcloud', url: 'https://soundcloud.com/search?q=vaporwave' }
    ],

    init: function() {
        this.modalElement = document.getElementById('radio-modal');
        this.closeButton = this.modalElement.querySelector('.close-btn');
        this.enableAudioButton = document.getElementById('enable-audio-btn');
        this.audioGateElement = document.getElementById('audio-gate');
        this.radioPlayerElement = document.getElementById('radio-player');
        this.radioPlayerElement.hidden = true; // Start with player hidden
        this.stationListElement = document.getElementById('station-list');
        this.nowPlayingElement = document.getElementById('now-playing');

        var musicButton = document.getElementById('music-btn');
        if (musicButton) {
            musicButton.addEventListener('click', this.open.bind(this));
        }
        this.closeButton.addEventListener('click', this.close.bind(this));
        this.enableAudioButton.addEventListener('click', this.enableAudio.bind(this));

        this.audioElement = new Audio();

        bootlog.log('Radio system initialized.');
    },

    open: function() {
        this.modalElement.hidden = false;
    },

    close: function() {
        this.audioElement.pause();
        this.nowPlayingElement.textContent = '--';
        this.modalElement.hidden = true;
    },

    enableAudio: function() {
        // Create and resume AudioContext to unlock audio on iOS
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudio-context)();
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        }

        this.audioGateElement.hidden = true;
        this.radioPlayerElement.hidden = false;
        this.populateStations();
    },

    populateStations: function() {
        var html = '';
        for (var i = 0; i < this.stations.length; i++) {
            var station = this.stations[i];
            html += '<li><button class="station-btn" data-index="' + i + '">' + station.name + '</button></li>';
        }
        this.stationListElement.innerHTML = html;

        var stationButtons = this.stationListElement.querySelectorAll('.station-btn');
        for (var j = 0; j < stationButtons.length; j++) {
            stationButtons[j].addEventListener('click', this.onStationClick.bind(this));
        }
    },

    onStationClick: function(event) {
        var index = parseInt(event.target.getAttribute('data-index'), 10);
        var station = this.stations[index];
        this.playStation(station);
    },

    playStation: function(station) {
        this.nowPlayingElement.textContent = station.name;

        if (station.type === 'direct') {
            this.audioElement.src = station.url;
            this.audioElement.play();
        } else if (station.type === 'youtube' || station.type === 'soundcloud') {
            window.open(station.url, '_blank');
            this.audioElement.pause();
        }
    }
};
