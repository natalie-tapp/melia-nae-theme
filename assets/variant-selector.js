// Melia Nae — Variant Selector
(function() {
  function fmt(cents) {
    return '$' + (cents / 100).toFixed(2).replace(/\.00$/, '');
  }

  function init() {
    var el = document.getElementById('mn-variants-data');
    if (!el) { console.warn('MN: mn-variants-data element not found'); return; }

    var variants;
    try { variants = JSON.parse(el.textContent); }
    catch(e) { console.error('MN: JSON parse error', e); return; }

    if (!variants || !variants.length) { console.warn('MN: no variants'); return; }
    console.log('MN: loaded', variants.length, 'variants');

    window.updateVariant = function(btn) {
      var group = btn.closest('.option-swatches');
      group.querySelectorAll('.swatch-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');

      var selected = [];
      document.querySelectorAll('.option-swatches').forEach(function(g) {
        var a = g.querySelector('.swatch-btn.active');
        if (a) selected.push(a.dataset.value);
      });
      console.log('MN: selected', selected);

      var match = null;
      for (var i = 0; i < variants.length; i++) {
        var v = variants[i];
        var opts = [v.option1, v.option2, v.option3].filter(function(x) { return x != null; });
        if (selected.every(function(s, idx) { return opts[idx] === s; })) {
          match = v; break;
        }
      }
      if (!match) { console.log('MN: no match for', selected); return; }
      console.log('MN: match', match.id, match.title, 'price cents:', match.price);

      var vid = document.getElementById('variant-id');
      if (vid) vid.value = match.id;

      var priceEl = document.getElementById('product-price');
      if (priceEl) priceEl.textContent = fmt(match.price);

      var apEl = document.querySelector('.product-afterpay');
      if (apEl) apEl.innerHTML = 'or <strong>4 payments of ' + fmt(Math.round(match.price / 4)) + '</strong> with Afterpay';

      var addBtn = document.querySelector('button[name="add"]');
      if (addBtn) {
        addBtn.textContent = match.available ? 'Add to Bag' : 'Sold Out';
        addBtn.disabled = !match.available;
      }

      if (window.history && window.history.replaceState) {
        var url = new URL(window.location.href);
        url.searchParams.set('variant', match.id);
        window.history.replaceState({}, '', url.toString());
      }
    };
    console.log('MN: updateVariant ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
