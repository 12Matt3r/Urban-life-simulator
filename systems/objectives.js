// systems/objectives.js

var Objectives = {

    objectiveDb: {
        'reach_high_heat': {
            description: 'Get your heat level to 25 or more.',
            condition: function() {
                return gameState.character && gameState.character.stats.heat >= 25;
            }
        },
        'explore_the_city': {
            description: 'Travel to a new district.',
            condition: function() {
                return gameState.character && gameState.character.stats.districts_visited > 1;
            }
        },
        'become_charismatic': {
            description: 'Increase your charisma to 15.',
            condition: function() {
                return gameState.character && gameState.character.stats.cha >= 15;
            }
        }
    },

    roleObjectives: {
        'Vigilante': ['reach_high_heat'],
        'Data Broker': ['explore_the_city'],
        'Street Artist': ['become_charismatic'],
        'default': ['explore_the_city']
    },

    init: function() {
        eventBus.on('character:created', this.onCharacterCreated.bind(this));
        eventBus.on('character.stats.updated', this.evaluateObjectives.bind(this));
        bootlog.log('Objectives system initialized.');
    },

    onCharacterCreated: function(character) {
        this.seedObjectives(character.role);
        this.updateHud();
    },

    seedObjectives: function(role) {
        gameState.objectives = [];
        var objectiveIds = this.roleObjectives[role] || this.roleObjectives['default'];

        for (var i = 0; i < objectiveIds.length; i++) {
            var id = objectiveIds[i];
            if (this.objectiveDb[id]) {
                gameState.objectives.push({
                    id: id,
                    description: this.objectiveDb[id].description,
                    condition: this.objectiveDb[id].condition,
                    completed: false
                });
            }
        }
    },

    evaluateObjectives: function() {
        if (!gameState.objectives) return;
        var needsUpdate = false;

        for (var i = 0; i < gameState.objectives.length; i++) {
            var obj = gameState.objectives[i];
            if (!obj.completed && obj.condition()) {
                obj.completed = true;
                needsUpdate = true;
                eventBus.emit('objective:completed', obj);
                bootlog.log('Objective completed: ' + obj.description);
            }
        }

        if (needsUpdate) {
            this.updateHud();
        }
    },

    updateHud: function() {
        eventBus.emit('objectives:updated', gameState.objectives);
    }
};
