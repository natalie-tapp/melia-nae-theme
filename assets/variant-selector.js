// Melia Nae — Variant Selector
(function() {
  // window.__variants is set inline in the product template script block
  function ready(fn) {
    if (document.readyState !== 'loading') { fn(); }
    else { document.addEventListener('DOMContentLoaded', fn); }
  }

  function fmt(cents) {
    return '$' + (cents / 100).toFixed(2).replace(/\.00$/, '');
  }

  function define() {
    var variants = window.__variants;
    if (!variants || !variants.length) {
      console.warn('MN: __variants not found or empty');
      return;
    }
    console.log('MN: variant-selector ready, ' + variants.length + ' variants');

    window.updateVariant = function(btn) {
      // Activate clicked swatch
      var group = btn.closest('.option-swatches');
      group.querySelectorAll('.swatch-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');

      // Collect selected option values in DOM order
      var selected = [];
      document.querySelectorAll('.option-swatches').forEach(function(g) {
        var a = g.querySelector('.swatch-btn.active');
        if (a) selected.push(a.dataset.value);
      });
      console.log('MN: selected:', selected);

      // Find matching variant
      var match = null;
      for (var i = 0; i < variants.length; i++) {
        var v = variants[i];
        var opts = [v.option1, v.option2, v.option3].filter(function(x) { return x != null; });
        if (selected.every(function(s, idx) { return opts[idx] === s; })) {
          match = v; break;
        }
      }

      if (!match) { console.log('MN: no match for', selected); return; }
      console.log('MN: matched variant', match.id, match.title, 'price cents:', match.price);

      // Update hidden input
      var vid = document.getElementById('variant-id');
      if (vid) vid.value = match.id;

      // Update price
      var priceEl = document.getElementById('product-price');
      if (priceEl) priceEl.textContent = fmt(match.price);

      // Update Afterpay
      var apEl = document.querySelector('.product-afterpay');
      if (apEl) {
        apEl.innerHTML = 'or <strong>4 payments of ' + fmt(Math.round(match.price / 4)) + '</strong> with Afterpay';
      }

      // Update sticky Afterpay if present
      var apEl2 = document.querySelector('.sticky-afterpay');
      if (apEl2) {
        apEl2.innerHTML = 'or <strong>4 x ' + fmt(Math.round(match.price / 4)) + '</strong> with Afterpay';
      }

      // Add to cart button
      var addBtn = document.querySelector('button[name="add"]');
      if (addBtn) {
        addBtn.textContent = match.available ? 'Add to Bag' : 'Sold Out';
        addBtn.disabled = !match.available;
      }

      // URL
      if (window.history && window.history.replaceState) {
        var url = new URL(window.location.href);
        url.searchParams.set('variant', match.id);
        window.history.replaceState({}, '', url.toString());
      }
    };

    console.log('MN: window.updateVariant defined');
  }

  // Define immediately if __variants already set, else wait for DOM
  if (window.__variants) { define(); }
  else { ready(define); }
})();
