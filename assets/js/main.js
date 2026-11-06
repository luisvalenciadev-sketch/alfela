/* ==========================================================================
   ALFELA · Interacciones de la landing
   1. Menú hamburguesa (móvil)
   2. Selector de tallas XS / S / M (Tan Alfela)
   3. Botones "Comprar" → evento para la pasarela de pago
   4. Resaltado del menú según la sección visible
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------ 1. Menú móvil ------- */
  // La animación de entrada/salida y el cruce de íconos viven en CSS (.mobile-menu, .menu-toggle)
  var toggle = document.getElementById('menu-toggle');
  var menu = document.getElementById('mobile-menu');

  function setMenu(open) {
    if (!toggle || !menu) return;
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      setMenu(menu.hidden);
    });
    // Cerrar al elegir una sección (el scroll suave lo hace el CSS)
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    // Cerrar al tocar fuera del header
    document.addEventListener('pointerdown', function (e) {
      if (!menu.hidden && !e.target.closest('header')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) {
        setMenu(false);
        toggle.focus();
      }
    });
    window.matchMedia('(min-width: 768px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* ------------------------------------------- 2. Selector de tallas ---- */
  var SIZE_HINTS = {
    XS: 'Silueta XS: líneas ultra-delgadas para un efecto sutil y favorecedor.',
    S: 'Silueta S: la marca de bikini clásica y equilibrada para el día a día.',
    M: 'Silueta M: cobertura más amplia y definida, ideal para contrastes marcados.'
  };
  var sizeGroup = document.querySelector('[data-size-group]');
  var sizeHint = document.querySelector('[data-size-hint]');
  var tanBuy = document.querySelector('[data-buy-tan]');

  if (sizeGroup) {
    sizeGroup.addEventListener('click', function (e) {
      var chip = e.target.closest('[data-size]');
      if (!chip) return;
      var size = chip.getAttribute('data-size');
      sizeGroup.querySelectorAll('[data-size]').forEach(function (c) {
        c.setAttribute('aria-pressed', String(c === chip));
      });
      if (sizeHint && SIZE_HINTS[size]) sizeHint.textContent = SIZE_HINTS[size];
      if (tanBuy) tanBuy.setAttribute('data-size', size); // la talla viaja con la compra
    });
  }

  /* ------------------------------------- 3. Botones de compra ----------- */
  // Cada botón tiene data-product (duna | tan-alfela | glowe | kit) y data-price.
  // Para conectar la pasarela, define antes de este script o en otro archivo:
  //
  //   window.AlfelaCheckout = function ({ product, price, size }) { ... };
  //
  // o escucha el evento:  document.addEventListener('alfela:buy', e => e.detail)
  //
  // Mientras no exista una pasarela, se abre WhatsApp con el producto elegido.
  var PRODUCT_NAMES = { duna: 'Duna', 'tan-alfela': 'Tan Alfela', glowe: 'Glowe', kit: 'Kit Alfela' };

  function whatsappBase() {
    var cta = document.getElementById('whatsapp-cta');
    return cta ? cta.href.split('?')[0] : null;
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-product]');
    if (!btn) return;

    var detail = {
      product: btn.getAttribute('data-product'),
      price: Number(btn.getAttribute('data-price')) || null,
      size: btn.getAttribute('data-size') || null
    };

    var evt = new CustomEvent('alfela:buy', { detail: detail, cancelable: true });
    var notCancelled = document.dispatchEvent(evt);

    if (typeof window.AlfelaCheckout === 'function') {
      window.AlfelaCheckout(detail);
      return;
    }
    if (!notCancelled) return; // otro script ya manejó la compra

    var base = whatsappBase();
    if (!base) return;
    var msg = 'Hola Alfela, quiero comprar ' + (PRODUCT_NAMES[detail.product] || detail.product) +
      (detail.size ? ' (talla ' + detail.size + ')' : '');
    window.open(base + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  });

  /* ----------------------------------- 4. Menú activo (scrollspy) ------- */
  var spyLinks = document.querySelectorAll('[data-spy]');
  if ('IntersectionObserver' in window && spyLinks.length) {
    var byId = {};
    spyLinks.forEach(function (a) { byId[a.getAttribute('data-spy')] = a; });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        spyLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
        var link = byId[entry.target.id];
        if (link) link.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    Object.keys(byId).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }
})();
