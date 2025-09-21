// ui/character_creation.js

var CharacterCreation = {
    screenElement: null,
    roleInputElement: null,
    startGameButton: null,
    suggestedRoleButtons: [],

    // A simple list of forbidden words. This should be expanded.
    forbiddenRoles: ['nazi', 'slave', 'rapist'], // Just an example list.

    init: function() {
        this.screenElement = document.getElementById('character-creation-screen');
        this.roleInputElement = document.getElementById('role-input');
        this.startGameButton = document.getElementById('start-game-btn');
        this.suggestedRoleButtons = document.querySelectorAll('.role-suggestion');

        // Add event listeners
        this.startGameButton.addEventListener('click', this.startGame.bind(this));

        for (var i = 0; i < this.suggestedRoleButtons.length; i++) {
            this.suggestedRoleButtons[i].addEventListener('click', this.onSuggestionClick.bind(this));
        }

        bootlog.log('Character Creation initialized.');
    },

    show: function() {
        this.screenElement.style.display = 'flex';
        // Hide the main game container if it exists
        var mainContainer = document.getElementById('main-container');
        if (mainContainer) {
            mainContainer.style.display = 'none';
        }
    },

    hide: function() {
        this.screenElement.style.display = 'none';
        // Show the main game container
        var mainContainer = document.getElementById('main-container');
        if (mainContainer) {
            mainContainer.style.display = 'flex';
        }
    },

    onSuggestionClick: function(event) {
        this.roleInputElement.value = event.target.textContent;
    },

    sanitizeRole: function(role) {
        var sanitizedRole = role.trim();

        // Replace "Sex Worker" with "Entertainer" (case-insensitive)
        if (sanitizedRole.toLowerCase() === 'sex worker') {
            return 'Entertainer';
        }

        // Check for forbidden words
        for (var i = 0; i < this.forbiddenRoles.length; i++) {
            if (sanitizedRole.toLowerCase().indexOf(this.forbiddenRoles[i]) !== -1) {
                // Replace with a neutral role if offensive
                return 'Citizen';
            }
        }

        return sanitizedRole;
    },

    getStats: function() {
        return {
            str: parseInt(document.getElementById('stat-str').textContent, 10),
            dex: parseInt(document.getElementById('stat-dex').textContent, 10),
            con: parseInt(document.getElementById('stat-con').textContent, 10),
            int: parseInt(document.getElementById('stat-int').textContent, 10),
            wis: parseInt(document.getElementById('stat-wis').textContent, 10),
            cha: parseInt(document.getElementById('stat-cha').textContent, 10),
            heat: 0, // Initial heat
            districts_visited: 1
        };
    },

    startGame: function() {
        var role = this.roleInputElement.value;
        if (!role) {
            alert("Please enter a role to begin.");
            return;
        }

        var sanitizedRole = this.sanitizeRole(role);

        gameState.character = {
            role: sanitizedRole,
            stats: this.getStats()
        };

        bootlog.log('Character created: ' + JSON.stringify(gameState.character));

        // Hide and remove the character creation screen
        this.screenElement.hidden = true;
        var screen = this.screenElement;
        requestAnimationFrame(function() {
            if (screen && screen.parentNode) {
                screen.parentNode.removeChild(screen);
            }
        });

        // Show the main game container
        var mainContainer = document.getElementById('main-container');
        if (mainContainer) {
            mainContainer.style.display = 'flex';
        }

        eventBus.emit('character:created', gameState.character);
    }
};
