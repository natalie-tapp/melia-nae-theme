// Melia Nae — Variant Selector
(function() {
  var el = document.getElementById('mn-variants-data');
  if (!el) { console.warn('MN: mn-variants-data not found'); return; }

  var variants;
  try { variants = JSON.parse(el.textContent); }
  catch(e) { console.error('MN variant parse error:', e); return; }

  console.log('MN: variant-selector loaded, variants:', variants.length);

  function fmt(cents) {
    var n = parseFloat(cents);
    // Shopify Liquid | json returns price in cents (integer)
    var dollars = n / 100;
    return '$' + dollars.toFixed(2).replace(/\.00$/, '');
  }

  window.updateVariant = function(btn) {
    // Mark active in this swatch group
    var group = btn.closest('.option-swatches');
    group.querySelectorAll('.swatch-btn').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');

    // Collect one selected value per option group (in DOM order)
    var selected = [];
    document.querySelectorAll('.option-swatches').forEach(function(g) {
      var a = g.querySelector('.swatch-btn.active');
      if (a) selected.push(a.dataset.value);
    });

    console.log('MN: selected options:', selected);

    // Find matching variant
    var match = null;
    for (var i = 0; i < variants.length; i++) {
      var v = variants[i];
      var vOptions = [v.option1, v.option2, v.option3].filter(function(x) { return x != null; });
      var ok = selected.every(function(s, idx) { return vOptions[idx] === s; });
      if (ok) { match = v; break; }
    }

    if (!match) {
      console.log('MN: No variant found for:', selected);
      return;
    }
    console.log('MN: matched variant:', match.id, match.title, match.price);

    // Update hidden variant ID
    var vid = document.getElementById('variant-id');
    if (vid) vid.value = match.id;

    // Update price display
    var priceEl = document.getElementById('product-price');
    if (priceEl) priceEl.textContent = fmt(match.price);

    // Update Afterpay
    var apEl = document.querySelector('.product-afterpay');
    if (apEl) {
      var payment = Math.round(match.price / 4);
      apEl.innerHTML = 'or <strong>4 payments of ' + fmt(payment) + '</strong> with Afterpay';
    }

    // Update add to cart button
    var addBtn = document.querySelector('button[name="add"]');
    if (addBtn) {
      addBtn.textContent = match.available ? 'Add to Bag' : 'Sold Out';
      addBtn.disabled = !match.available;
    }

    // Update URL without page reload
    if (window.history && window.history.replaceState) {
      var url = new URL(window.location.href);
      url.searchParams.set('variant', match.id);
      window.history.replaceState({}, '', url.toString());
    }
  };

  console.log('MN: window.updateVariant defined successfully');
})();
