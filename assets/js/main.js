/* ==========================================================================
   ALFELA · Interacciones de la landing
    0. Medición del embudo: track() → dataLayer + evento alfela:track
    1. Menú hamburguesa (móvil)
    2. Selector de tallas XS / S / M (Tan Alfela)
    3. Botones "Comprar" → evento para la pasarela de pago (o WhatsApp de respaldo)
    4. Resaltado del menú según la sección visible
    5. Vista previa del contenido pendiente (?pendientes)
    6. Comparador antes / después
    7. Videos de clientas: uno a la vez
    8. Animación #5 (aparición de grillas)
    9. Animación #1 (barra de compra móvil que aparece y se oculta)
   10. Embudo: secciones vistas, interacciones y referencia A/B en WhatsApp
   La animación #2 (hero), la guía de intensidad, la silueta de tallas y la
   visibilidad de las variantes A/B son solo CSS.
   ========================================================================== */
(function () {
  'use strict';

  window.__alfelaReady = true; // el <head> lo revisa: si no llega, deja todo visible

  function reduceMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* --------------------------------------- 0. Medición del embudo ------- */
  // Todos los eventos pasan por track(): se agregan a window.dataLayer (formato GA4/GTM)
  // con la variante A/B de la visitante, y analytics.js los reenvía a GA4, Meta y TikTok
  // solo si hay IDs configurados y la usuaria aceptó las cookies.
  var AB = window.alfelaAB || { tests: {}, shown: {}, ref: '', qa: false };

  function abParams() {
    var p = {};
    Object.keys(AB.tests).forEach(function (t) {
      if (AB.tests[t].active) p['ab_' + t] = AB.shown[t];
    });
    return p;
  }

  function track(name, params) {
    var payload = Object.assign({ event: name, _alfela: true }, abParams(),
      AB.qa ? { traffic_type: 'internal' } : {}, params || {});
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    document.dispatchEvent(new CustomEvent('alfela:track', { detail: payload }));
  }
  window.alfelaTrack = track;

  // Dónde ocurrió la acción: barra móvil o id de la sección (hero, productos, kit…)
  function placement(el) {
    if (el.closest('[data-quickbar]')) return 'barra_movil';
    if (el.closest('header')) return 'header';
    if (el.closest('footer')) return 'footer';
    var section = el.closest('section[id]');
    return section ? section.id : 'otro';
  }

  // Exposición a cada prueba activa (una vez por página vista)
  Object.keys(AB.tests).forEach(function (t) {
    if (AB.tests[t].active) track('experiment_view', { experiment_id: t, variant_id: AB.shown[t] });
  });

  // Código de referencia para atribuir ventas por WhatsApp: 1.ª letra = hero, 2.ª = orden.
  // Ej.: "AB-7K2Q" → hero a, orden b. QA- marca pruebas internas.
  var REF = (AB.qa ? 'QA-' : '') + ((AB.shown.hero || 'a') + (AB.shown.orden || 'a')).toUpperCase() +
    (AB.ref ? '-' + AB.ref : '');
  function withRef(text) { return text + ' (ref. ' + REF + ')'; }

  /* ----------------- 8. Animación #5 · grillas al entrar en pantalla ---- */
  // El <head> pone .js-reveal en <html> (oculta los [data-reveal]); aquí se revelan
  // una sola vez, escalonados por su posición dentro de la grilla (--i).
  if (document.documentElement.classList.contains('js-reveal')) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });

    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) {
        return c.hasAttribute('data-reveal');
      });
      el.style.setProperty('--i', String(siblings.indexOf(el)));
      revealObserver.observe(el);
    });
  }

  /* ------------- 9. Animación #1 · barra de compra móvil ---------------- */
  // Visible solo cuando ningún CTA marcado con [data-hides-quickbar] está en pantalla,
  // para no repetir el mismo botón dos veces. La animación vive en CSS (.quickbar).
  var quickbar = document.querySelector('[data-quickbar]');
  var barTargets = document.querySelectorAll('[data-hides-quickbar]');
  if (quickbar && barTargets.length && document.documentElement.classList.contains('js-bar')) {
    var onScreen = [];
    var barObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var i = onScreen.indexOf(entry.target);
        if (entry.isIntersecting && i === -1) onScreen.push(entry.target);
        if (!entry.isIntersecting && i !== -1) onScreen.splice(i, 1);
      });
      quickbar.classList.toggle('is-shown', onScreen.length === 0);
    });
    barTargets.forEach(function (t) { barObserver.observe(t); });
  }

  /* ------------------------------ 5. Vista previa de pendientes --------- */
  // Abre la página con ?pendientes para ver los bloques con data-pending
  // (NSO INVIMA, reseñas, videos, antes/después) antes de publicarlos.
  if (/[?&]pendientes(=|&|$)/.test(location.search)) {
    document.documentElement.classList.add('show-pending');
    var banner = document.createElement('p');
    banner.className = 'bg-gold px-4 py-2 text-center text-body-sm font-bold text-navy';
    banner.textContent = 'Vista previa: los bloques con borde punteado están pendientes y no se ven en el sitio publicado.';
    document.body.prepend(banner);
  }

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
      if (sizeHint && SIZE_HINTS[size] && sizeHint.textContent !== SIZE_HINTS[size]) {
        sizeHint.textContent = SIZE_HINTS[size];
        // Animación #4: el texto nuevo entra con un fundido de 150 ms
        // (la píldora y la silueta se mueven solo con CSS a partir de aria-pressed)
        if (sizeHint.animate && !reduceMotion()) {
          sizeHint.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
        }
      }
      if (tanBuy) tanBuy.setAttribute('data-size', size); // la talla viaja con la compra
      track('select_size', { size: size });
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

    // Embudo: intención de compra (GA4 ecommerce: add_to_cart)
    var item = { item_id: detail.product, item_name: PRODUCT_NAMES[detail.product] || detail.product, quantity: 1 };
    if (detail.price) item.price = detail.price;
    if (detail.size) item.item_variant = detail.size;
    var commerce = { currency: 'COP', items: [item], placement: placement(btn) };
    if (detail.price) commerce.value = detail.price;
    track('add_to_cart', commerce);

    var evt = new CustomEvent('alfela:buy', { detail: detail, cancelable: true });
    var notCancelled = document.dispatchEvent(evt);

    if (typeof window.AlfelaCheckout === 'function') {
      track('begin_checkout', commerce);
      window.AlfelaCheckout(detail);
      return;
    }
    if (!notCancelled) return; // otro script ya manejó la compra

    var base = whatsappBase();
    if (!base) return;
    var msg = withRef('Hola Alfela, quiero comprar ' + (PRODUCT_NAMES[detail.product] || detail.product) +
      (detail.size ? ' (talla ' + detail.size + ')' : ''));
    track('whatsapp_click', { reason: 'compra', item_id: detail.product, placement: commerce.placement, ref: REF });
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

  /* ------------------------------- 6. Comparador antes / después -------- */
  // Arrastre directo (sin transición: la línea sigue al dedo). El <input range>
  // oculto da soporte de teclado y lector de pantalla y se mantiene sincronizado.
  document.querySelectorAll('[data-ba]').forEach(function (ba, index) {
    var range = ba.querySelector('.ba__range');
    var dragging = false;
    var tracked = false;

    function set(value) {
      var v = Math.max(0, Math.min(100, value));
      ba.style.setProperty('--pos', v + '%');
      if (range) range.value = String(Math.round(v));
      if (!tracked) { tracked = true; track('compare_interact', { compare_index: index + 1 }); }
    }
    function fromPointer(e) {
      var r = ba.getBoundingClientRect();
      return ((e.clientX - r.left) / r.width) * 100;
    }

    if (range) range.addEventListener('input', function () { set(Number(range.value)); });

    ba.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      dragging = true;
      ba.setPointerCapture(e.pointerId);
      set(fromPointer(e));
    });
    ba.addEventListener('pointermove', function (e) {
      if (dragging) set(fromPointer(e));
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (type) {
      ba.addEventListener(type, function () { dragging = false; });
    });
  });

  /* ----------------------------- 7. Videos: uno a la vez ---------------- */
  document.addEventListener('play', function (e) {
    var current = e.target;
    if (!current.matches || !current.matches('[data-testimonial-video]')) return;
    document.querySelectorAll('[data-testimonial-video]').forEach(function (v) {
      if (v !== current && !v.paused) v.pause();
    });
    var source = current.querySelector('source');
    track('video_play', { video: source ? source.getAttribute('src') : 'video' });
  }, true);

  /* ------------------------------------------------ 10. Embudo ---------- */
  // a) Secciones vistas (una vez cada una, cuando su borde superior pasa la mitad de la
  //    pantalla). Con esto se ve en qué sección se va la gente.
  if ('IntersectionObserver' in window) {
    var seen = {};
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id || entry.target.getAttribute('aria-labelledby') || 'seccion';
        sectionObserver.unobserve(entry.target);
        if (seen[id]) return;
        seen[id] = true;
        track('section_view', { section: id });
      });
    }, { rootMargin: '0px 0px -50% 0px' });
    document.querySelectorAll('main > section').forEach(function (s) { sectionObserver.observe(s); });
  }

  // b) Intensidad elegida, preguntas abiertas y enlaces marcados con data-track
  document.addEventListener('change', function (e) {
    if (e.target.name === 'intensidad') track('select_intensity', { level: e.target.value });
  });
  document.querySelectorAll('.faq-item').forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      var q = d.querySelector('summary span');
      track('faq_open', { question: q ? q.textContent.trim() : '' });
    });
  });
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-track]');
    if (el) track(el.getAttribute('data-track'), { placement: placement(el) });
  });

  // c) WhatsApp de consulta: cada enlace lleva la referencia A/B en el mensaje y se mide el clic
  document.querySelectorAll('a[href*="wa.me/"]').forEach(function (a) {
    var parts = a.getAttribute('href').split('?');
    var text = new URLSearchParams(parts[1] || '').get('text') || 'Hola Alfela';
    a.setAttribute('href', parts[0] + '?text=' + encodeURIComponent(withRef(text)));
    a.addEventListener('click', function () {
      var where = placement(a);
      track('whatsapp_click', { reason: where === 'resultados' ? 'compartir_resultado' : 'consulta', placement: where, ref: REF });
    });
  });
})();
