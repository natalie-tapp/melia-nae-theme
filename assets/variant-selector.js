
// Melia Nae — Variant Selector
(function() {
  var el = document.getElementById('mn-variants-data');
  if (!el) return;

  var variants;
  try { variants = JSON.parse(el.textContent); }
  catch(e) { console.error('MN variant parse error:', e); return; }

  function fmt(cents) {
    var n = parseFloat(cents);
    // Shopify Liquid | json returns price in cents
    var dollars = n > 1000 ? n / 100 : n;
    return '$' + dollars.toFixed(2).replace(/\.00$/, '');
  }

  window.updateVariant = function(btn) {
    var group = btn.closest('.option-swatches');
    group.querySelectorAll('.swatch-btn').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');

    var selected = [];
    document.querySelectorAll('.option-swatches').forEach(function(g) {
      var a = g.querySelector('.swatch-btn.active');
      if (a) selected.push(a.dataset.value);
    });

    var match = null;
    for (var i = 0; i < variants.length; i++) {
      var v = variants[i];
      var ok = selected.every(function(s, idx) {
        return v['option' + (idx + 1)] === s;
      });
      if (ok) { match = v; break; }
    }

    if (!match) {
      console.log('No variant found for:', selected);
      return;
    }

    // Update hidden variant ID
    var vid = document.getElementById('variant-id');
    if (vid) vid.value = match.id;

    // Update price
    var priceEl = document.getElementById('product-price');
    if (priceEl) priceEl.textContent = fmt(match.price);

    // Update Afterpay
    var apEl = document.querySelector('.product-afterpay');
    if (apEl) {
      var n = parseFloat(match.price);
      var dollars = n > 1000 ? n / 100 : n;
      apEl.innerHTML = 'or <strong>4 payments of ' + fmt(Math.round(dollars * 25)) + '</strong> with Afterpay';
    }

    // Update add to cart button
    var addBtn = document.querySelector('button[name="add"]');
    if (addBtn) {
      addBtn.textContent = match.available ? 'Add to Bag' : 'Sold Out';
      addBtn.disabled = !match.available;
    }

    // Update URL
    try {
      var url = new URL(window.location.href);
      url.searchParams.set('variant', match.id);
      window.history.replaceState({}, '', url.toString());
    } catch(e) {}
  };
})();
