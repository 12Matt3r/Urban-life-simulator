// systems/time.js
var Time = {
    day: 1,
    hour: 8,
    minute: 0,

    init: function() {
        bootlog.log('Time system initialized.');
        eventBus.on('game:loop', this.update.bind(this));
    },

    update: function() {
        this.minute++;
        if (this.minute >= 60) {
            this.minute = 0;
            this.hour++;

            // Emit hourly event
            eventBus.emit('time.hourly', { day: this.day, hour: this.hour });

            if (this.hour >= 24) {
                this.hour = 0;
                this.day++;
            }
        }

        eventBus.emit('time.tick', { day: this.day, hour: this.hour, minute: this.minute });
    }
};
