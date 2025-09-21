// Urban Life Simulator - Environment Flags

var Env = {
    debug: false
};

(function() {
    var queryString = window.location.search.substring(1);
    var params = queryString.split('&');
    for (var i = 0; i < params.length; i++) {
        var pair = params[i].split('=');
        if (decodeURIComponent(pair[0]) === 'debug' && decodeURIComponent(pair[1]) === '1') {
            Env.debug = true;
            break;
        }
    }
})();
