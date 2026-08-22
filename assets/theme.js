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

  /* ── Gallery hover-to-zoom ─────────────────────────────── */
  const galleryMain = document.querySelector('.gallery-main');
  const mainImgEl = document.getElementById('mainImg');
  if (galleryMain && mainImgEl) {
    galleryMain.addEventListener('mousemove', function (e) {
      const rect = galleryMain.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      mainImgEl.style.transformOrigin = x + '% ' + y + '%';
      mainImgEl.style.transform = 'scale(2)';
      galleryMain.style.cursor = 'crosshair';
    });
    galleryMain.addEventListener('mouseleave', function () {
      mainImgEl.style.transform = 'scale(1)';
      mainImgEl.style.transformOrigin = '50% 50%';
      galleryMain.style.cursor = '';
    });
  }

  /* ── Gallery prev/next arrows ──────────────────────────── */
  const galleryPrev = document.querySelector('.gallery-nav .gallery-prev');
  const galleryNext = document.querySelector('.gallery-nav .gallery-next');
  if ((galleryPrev || galleryNext) && mainImgEl) {
    const stepGallery = function (delta) {
      const thumbs = Array.from(document.querySelectorAll('.gallery-thumb'));
      if (!thumbs.length) return;
      let idx = thumbs.findIndex(t => t.classList.contains('active'));
      idx = (idx + delta + thumbs.length) % thumbs.length;
      thumbs.forEach(t => t.classList.remove('active'));
      thumbs[idx].classList.add('active');
      mainImgEl.src = thumbs[idx].querySelector('img').src;
    };
    if (galleryPrev) galleryPrev.addEventListener('click', () => stepGallery(-1));
    if (galleryNext) galleryNext.addEventListener('click', () => stepGallery(1));
  }

  /* ── AJAX add-to-cart on product form ──────────────────── */
  const productForm = document.getElementById('product-form');
  if (productForm) {
    productForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const submitBtn = productForm.querySelector('[name="add"]');
      const formData = new FormData(productForm);
      const orig = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) submitBtn.textContent = 'Adding…';
      fetch('/cart/add.js', { method: 'POST', body: formData, headers: { Accept: 'application/json' } })
        .then(res => res.json())
        .then(data => {
          if (data.status) {
            if (submitBtn) submitBtn.textContent = orig;
            alert(data.description || 'This item could not be added to your bag.');
            return;
          }
          if (submitBtn) { submitBtn.textContent = '✓ Added to Bag'; setTimeout(() => { submitBtn.textContent = orig; }, 1200); }
          refreshCart().then(openCart);
        })
        .catch(() => { if (submitBtn) submitBtn.textContent = orig; });
    });
  }

});

/* ═══════════════════════════════════════════════
   CART DRAWER (Shopify AJAX Cart API)
   ═══════════════════════════════════════════════ */
function formatMoney(cents) {
  return (cents / 100).toLocaleString('en-AU', { style: 'currency', currency: 'AUD' });
}

function updateCartBadge(count) {
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = count);
}

function renderCartDrawer(cart) {
  const body = document.getElementById('cartBody');
  const footer = document.getElementById('cartFooter');
  if (!body) return;
  if (!cart.items.length) {
    body.innerHTML = '<div class="cart-empty"><span>◇</span>Your bag is empty</div>';
    if (footer) footer.style.display = 'none';
    return;
  }
  body.innerHTML = cart.items.map(function (item) {
    return '<div class="cart-item">'
      + '<img class="cart-item-img" src="' + item.image + '" alt="' + item.product_title.replace(/"/g, '&quot;') + '" />'
      + '<div>'
      + '<div class="cart-item-name">' + item.product_title + '</div>'
      + '<div class="cart-item-meta">' + (item.variant_title ? item.variant_title + ' · ' : '') + 'Qty: ' + item.quantity + '</div>'
      + '<div class="cart-item-price">' + formatMoney(item.final_line_price) + '</div>'
      + '</div>'
      + '<button class="cart-item-remove" data-key="' + item.key + '">✕</button>'
      + '</div>';
  }).join('');
  document.querySelectorAll('.cart-item-remove').forEach(function (btn) {
    btn.onclick = function () { removeCartLine(btn.dataset.key); };
  });
  const subtotalEl = document.getElementById('cartSubtotal');
  if (subtotalEl) subtotalEl.textContent = formatMoney(cart.total_price);
  if (footer) footer.style.display = '';
}

function refreshCart() {
  return fetch('/cart.js')
    .then(res => res.json())
    .then(cart => {
      updateCartBadge(cart.item_count);
      renderCartDrawer(cart);
      return cart;
    });
}

function removeCartLine(key) {
  fetch('/cart/change.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: key, quantity: 0 })
  }).then(() => refreshCart());
}

function openCart() {
  refreshCart();
  document.getElementById('cartOverlay').classList.add('open');
  document.getElementById('cartDrawer').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartOverlay').classList.remove('open');
  document.getElementById('cartDrawer').classList.remove('open');
  document.body.style.overflow = '';
}

/* ═══════════════════════════════════════════════
   SEARCH OVERLAY (Shopify Predictive Search API)
   ═══════════════════════════════════════════════ */
let _searchTimer = null;

function doSearch(q) {
  const el = document.getElementById('search-results');
  if (!el) return;
  clearTimeout(_searchTimer);
  if (!q || q.trim().length < 2) { el.style.display = 'none'; return; }
  el.style.display = '';
  el.innerHTML = '<p class="search-no-results">Searching…</p>';
  _searchTimer = setTimeout(function () {
    fetch('/search/suggest.json?q=' + encodeURIComponent(q) + '&resources[type]=product&resources[limit]=8&resources[options][fields]=title,product_type,vendor,tag,variants.title')
      .then(res => res.json())
      .then(data => {
        const hits = (data.resources && data.resources.results && data.resources.results.products) || [];
        if (!hits.length) { el.innerHTML = '<p class="search-no-results">No results for “' + q + '”</p>'; return; }
        el.innerHTML = hits.map(function (p) {
          const img = p.featured_image ? p.featured_image.url : (p.image || '');
          return '<a href="' + p.url + '" class="search-result-item">'
            + (img ? '<img src="' + img + '" class="search-result-thumb" loading="lazy"/>' : '<div class="search-result-thumb"></div>')
            + '<div><p class="search-result-name">' + p.title + '</p>'
            + '<p class="search-result-price">' + p.price + '</p></div></a>';
        }).join('');
      })
      .catch(() => { el.innerHTML = '<p class="search-no-results">Search unavailable right now.</p>'; });
  }, 250);
}

function openSearch() {
  document.getElementById('search-overlay').classList.add('open');
  setTimeout(() => document.getElementById('search-input').focus(), 50);
}

function closeSearch() {
  document.getElementById('search-overlay').classList.remove('open');
  document.getElementById('search-input').value = '';
  const el = document.getElementById('search-results');
  if (el) el.style.display = 'none';
}

function closeSearchOutside(e) {
  if (e.target === document.getElementById('search-overlay')) closeSearch();
}

function handleSearchKey(e) {
  if (e.key === 'Escape') closeSearch();
  if (e.key === 'Enter') {
    const q = document.getElementById('search-input').value.trim();
    if (q) window.location.href = '/search?q=' + encodeURIComponent(q);
  }
}

/* ═══════════════════════════════════════════════
   MOBILE NAV
   ═══════════════════════════════════════════════ */
function openMobileNav() {
  document.getElementById('mobileNav').classList.add('open');
  document.getElementById('mobileNavOverlay').classList.add('open');
  document.getElementById('hamburger').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMobileNav() {
  document.getElementById('mobileNav').classList.remove('open');
  document.getElementById('mobileNavOverlay').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');
  document.body.style.overflow = '';
}

function toggleMobileSubmenu(btn) {
  const submenu = btn.nextElementSibling;
  const isOpen = submenu.classList.contains('open');
  // Close all open submenus first
  document.querySelectorAll('.mobile-nav-submenu.open').forEach(el => el.classList.remove('open'));
  document.querySelectorAll('.mobile-nav-toggle.open').forEach(el => el.classList.remove('open'));
  if (!isOpen) {
    submenu.classList.add('open');
    btn.classList.add('open');
  }
}
