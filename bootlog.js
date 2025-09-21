// Urban Life Simulator - Boot/Error Logging
var bootlog = {
    logElement: null,
    init: function() {
        this.logElement = document.getElementById('sim-log');
    },
    log: function(message) {
        if (this.logElement) {
            var timestamp = new Date().toLocaleTimeString();
            var logMessage = '[' + timestamp + '] ' + message;
            this.logElement.innerHTML += logMessage + '<br>';
            this.logElement.scrollTop = this.logElement.scrollHeight;
        }
        // Also log to console for debugging
        console.log(message);
    }
};
