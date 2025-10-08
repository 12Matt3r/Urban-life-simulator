export function createCredits(root = document.body, config = {}) {
  const overlay = document.createElement('div');
  overlay.id = 'credits-overlay-container';
  overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:10000; display:none; align-items:center; justify-content:center; color:white; font-family:sans-serif;';

  let creditsHtml = '<div style="text-align:center; max-width:600px;">';
  creditsHtml += '<h1>' + (config.title || 'Credits') + '</h1>';

  (config.roll || []).forEach(function(credit) {
    creditsHtml += '<p><strong style="color:#00ffa2;">' + credit.label + ':</strong> ' + credit.value + '</p>';
  });

  if (config.postCreditsCue) {
    creditsHtml += '<p style="margin-top: 30px; font-style:italic;">' + config.postCreditsCue + '</p>';
  }

  creditsHtml += '<button id="close-credits-btn" style="margin-top:20px; padding:10px 20px; background:var(--acc); color:var(--bg); border:none; border-radius:8px; cursor:pointer;">Continue</button>';
  creditsHtml += '</div>';

  overlay.innerHTML = creditsHtml;
  root.appendChild(overlay);

  function show() {
    overlay.style.display = 'flex';
  }

  function hide() {
    overlay.style.display = 'none';
  }

  overlay.querySelector('#close-credits-btn').onclick = hide;

  function destroy() {
    overlay.remove();
  }

  return { show, hide, destroy, el: overlay };
}