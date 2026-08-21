/* ═══════════════════════════════════════════════
   MELIA NAE — SHOPIFY THEME JS
   ═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

  /* ── Accordion ─────────────────────────────────────────── */
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      item.classList.toggle('open');
    });
  });

  /* ── Product gallery thumb click ───────────────────────── */
  document.querySelectorAll('.gallery-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      const mainImg = document.getElementById('mainImg');
      if (mainImg) {
        mainImg.src = thumb.querySelector('img').src;
      }
    });
  });

  /* ── Variant swatches ──────────────────────────────────── */
  document.querySelectorAll('.swatch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.option-swatches');
      group.querySelectorAll('.swatch-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  /* ── Quantity selector ─────────────────────────────────── */
  const qtyMinus = document.querySelector('.qty-btn.minus');
  const qtyPlus = document.querySelector('.qty-btn.plus');
  const qtyDisplay = document.querySelector('.qty-display');
  if (qtyMinus && qtyPlus && qtyDisplay) {
    let qty = 1;
    qtyMinus.addEventListener('click', () => { if (qty > 1) { qty--; qtyDisplay.textContent = qty; } });
    qtyPlus.addEventListener('click', () => { qty++; qtyDisplay.textContent = qty; });
  }

  /* ── View toggle (collection) ──────────────────────────── */
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  /* ── Filter group expand/collapse ──────────────────────── */
  document.querySelectorAll('.filter-group-header').forEach(header => {
    header.addEventListener('click', () => {
      const group = header.closest('.filter-group');
      const content = group.querySelectorAll('.filter-option, .price-inputs, .metal-swatches');
      const toggle = header.querySelector('span');
      content.forEach(el => el.style.display = el.style.display === 'none' ? '' : 'none');
      if (toggle) toggle.textContent = toggle.textContent === '+' ? '−' : '+';
    });
  });

  /* ── Category pills filter ─────────────────────────────── */
  const pills = document.querySelectorAll('.pill[data-filter]');
  if (pills.length) {
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const filter = pill.dataset.filter;
        document.querySelectorAll('.product-card').forEach(card => {
          const show = filter === 'all' || card.dataset.type === filter;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

  /* ── Metal swatch filter ───────────────────────────────── */
  document.querySelectorAll('.metal-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => swatch.classList.toggle('active'));
  });

});
