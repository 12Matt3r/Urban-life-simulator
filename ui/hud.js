// Urban Life Simulator - HUD Module
var HUD = {
    statsElement: null,
    wantedLevelElement: null,
    objectivesElement: null,
    timeElement: null,
    weatherElement: null,

    init: function() {
        this.statsElement = document.getElementById('stats');
        this.wantedLevelElement = document.getElementById('wanted-level');
        this.objectivesElement = document.getElementById('objectives');
        this.timeElement = document.getElementById('hud-time');
        this.weatherElement = document.getElementById('hud-weather');

        // Listen for events
        eventBus.on('character:created', this.render.bind(this));
        eventBus.on('character.stats.updated', this.render.bind(this));
        eventBus.on('objectives:updated', this.renderObjectives.bind(this));
        eventBus.on('time.tick', this.renderTime.bind(this));
        eventBus.on('weather:updated', this.renderWeather.bind(this));

        bootlog.log('HUD initialized.');
    },

    render: function() {
        if (gameState.character) {
            this.renderStats();
            this.renderWanted();
            this.renderObjectives();
        }
    },

    renderStats: function() {
        if (!this.statsElement) return;

        var stats = gameState.character.stats;
        var html = '<h3>Stats</h3><ul>';

        var statFullNames = {
            str: 'Strength',
            dex: 'Dexterity',
            con: 'Constitution',
            int: 'Intelligence',
            wis: 'Wisdom',
            cha: 'Charisma',
            heat: 'HEAT - Police attention'
        };

        for (var stat in stats) {
            if (stats.hasOwnProperty(stat)) {
                var statName = stat.toUpperCase();
                var statValue = stats[stat];
                var fullName = statFullNames[stat.toLowerCase()] || '';
                html += '<li><span class="stat-name" title="' + fullName + '">' + statName + '</span>: ' + statValue + '</li>';
            }
        }

        html += '</ul>';

        this.statsElement.innerHTML = html;
    },

    heatToStars: function(heat) {
        if (heat >= 95) return 5;
        if (heat >= 70) return 4;
        if (heat >= 45) return 3;
        if (heat >= 25) return 2;
        if (heat >= 10) return 1;
        return 0;
    },

    renderWanted: function() {
        if (!this.wantedLevelElement) return;

        var heat = gameState.character.stats.heat || 0;
        var stars = this.heatToStars(heat);
        var aria = 'Wanted level: ' + String(stars) + ' of 5';
        var html = '<h3>Wanted</h3><div role="img" aria-label="' + aria + '" title="Higher stars increase police attention. Travel or lay low to reduce heat."><span class="stars" aria-hidden="true">';

        for (var i = 1; i <= 5; i++) {
            var filled = i <= stars;
            var cls = 'star' + (filled ? ' filled' : '');
            if (filled && stars >= 4) cls += ' pulse';
            html += '<span class="' + cls + '">' + (filled ? '★' : '☆') + '</span>';
        }

        html += '</span></div>';

        this.wantedLevelElement.innerHTML = html;
    },

    renderObjectives: function() {
        if (!this.objectivesElement || !gameState.objectives) return;

        var html = '<h3>Objectives</h3><ul>';

        for (var i = 0; i < gameState.objectives.length; i++) {
            var obj = gameState.objectives[i];
            var status = obj.completed ? ' (Completed)' : '';
            var className = obj.completed ? 'completed' : '';
            html += '<li class="' + className + '">' + obj.description + status + '</li>';
        }

        html += '</ul>';

        this.objectivesElement.innerHTML = html;
    },

    renderTime: function(time) {
        if (!this.timeElement) return;

        var hour = time.hour < 10 ? '0' + time.hour : String(time.hour);
        var minute = time.minute < 10 ? '0' + time.minute : String(time.minute);
        this.timeElement.textContent = '🕒 ' + hour + ':' + minute + ' (Day ' + time.day + ')';

        // Set time of day attribute for ambience
        var tod = 'day';
        if (time.hour >= 20 || time.hour < 6) tod = 'night';
        else if (time.hour >= 18) tod = 'dusk';
        else if (time.hour < 8) tod = 'dawn';
        document.body.setAttribute('data-tod', tod);
    },

    renderWeather: function(weather) {
        if (!this.weatherElement) return;

        this.weatherElement.textContent = weather.icon + ' ' + weather.name;
        document.body.setAttribute('data-weather', weather.name.toLowerCase());
    }
};
