// realms/living-hell/systems/lh.chat.js (ES5)
(function (global) {
  var bus = global.eventBus;

  function init() {
    var input = document.getElementById('lh-chat-input');
    var send = document.getElementById('lh-chat-send');
    if (send) send.onclick = function () {
      var text = input.value.trim();
      if (!text) return;
      bus.publish('lh.chat.inject', { text: text });
      prependChat('you', text);
      input.value = '';
    };
  }

  function prependChat(who, text) {
    var host = document.getElementById('lh-chatlog');
    if (!host) return;
    var div = document.createElement('div');
    div.className = 'lh-msg ' + (who === 'you' ? 'user' : 'ai');
    div.textContent = (who === 'you' ? 'You: ' : 'Chat: ') + text;
    host.appendChild(div);
    host.scrollTop = host.scrollHeight;
  }

  global.LHChat = { init: init, prependChat: prependChat };

})(window);