/* ==========================================================================
   ALFELA · Analítica con consentimiento (Fase 4)
   - Mientras los IDs sigan como [PLACEHOLDER] no carga nada ni muestra el aviso.
   - Con algún ID configurado, pregunta una vez (Aceptar / Rechazar, mismo peso visual).
     Sin "Aceptar" no se carga ningún script de terceros.
   - Reenvía los eventos que main.js deja en window.dataLayer (_alfela: true),
     incluidos los ocurridos antes de aceptar en esa misma visita.
   - Si conectas Google Tag Manager en lugar de esto, usa directamente el dataLayer.
   Recuerda: al activar la analítica, revisa la sección 7 de privacidad.html.
   ========================================================================== */
(function () {
  'use strict';

  var CONFIG = {
    ga4: '[GA4-ID]',                  // p. ej. G-ABC123XYZ9
    metaPixel: '[META-PIXEL-ID]',     // p. ej. 123456789012345
    tiktokPixel: '[TIKTOK-PIXEL-ID]'  // p. ej. CABC123DEF456GHI
  };

  function configured(id) { return typeof id === 'string' && id !== '' && id.charAt(0) !== '['; }
  var on = { ga4: configured(CONFIG.ga4), meta: configured(CONFIG.metaPixel), tiktok: configured(CONFIG.tiktokPixel) };
  if (!on.ga4 && !on.meta && !on.tiktok) return; // sin analítica: nada que cargar ni preguntar

  var KEY = 'alfela-consent';
  function getConsent() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setConsent(value) { try { localStorage.setItem(KEY, value); } catch (e) { /* modo privado */ } }

  /* --------------------------------------------------- Carga de scripts */
  var loaded = false;
  var cursor = 0;

  function loadScript(src) {
    var s = document.createElement('script');
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
  }

  function loadVendors() {
    if (loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];

    if (on.ga4) {
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', CONFIG.ga4);
      loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(CONFIG.ga4));
    }

    if (on.meta) {
      /* eslint-disable */
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      /* eslint-enable */
      window.fbq('init', CONFIG.metaPixel);
      window.fbq('track', 'PageView');
    }

    if (on.tiktok) {
      /* eslint-disable */
      !function (w, d, t) { w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || []; ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie']; ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); }; }; for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]); ttq.instance = function (t) { for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]); return e; }; ttq.load = function (e, n) { var r = 'https://analytics.tiktok.com/i18n/pixel/events.js'; ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = r; ttq._t = ttq._t || {}; ttq._t[e] = +new Date(); ttq._o = ttq._o || {}; ttq._o[e] = n || {}; var s = d.createElement('script'); s.type = 'text/javascript'; s.async = !0; s.src = r + '?sdkid=' + e + '&lib=' + t; var f = d.getElementsByTagName('script')[0]; f.parentNode.insertBefore(s, f); }; }(window, document, 'ttq');
      /* eslint-enable */
      window.ttq.load(CONFIG.tiktokPixel);
      window.ttq.page();
    }

    flush();
  }

  /* ------------------------------------------- Reenvío de eventos ------ */
  // Meta y TikTok solo reciben los eventos estándar que usan para optimizar campañas.
  var META = { add_to_cart: 'AddToCart', begin_checkout: 'InitiateCheckout', whatsapp_click: 'Contact' };
  var TIKTOK = { add_to_cart: 'AddToCart', begin_checkout: 'InitiateCheckout', whatsapp_click: 'Contact' };

  function forward(payload) {
    var name = payload.event;
    var params = {};
    Object.keys(payload).forEach(function (k) {
      if (k !== 'event' && k !== '_alfela') params[k] = payload[k];
    });

    if (on.ga4 && window.gtag) window.gtag('event', name, params);

    // "Vio productos" = la sección de productos o el kit entró en pantalla
    var viewContent = name === 'section_view' && (params.section === 'productos' || params.section === 'kit');
    var items = params.items || [];
    var ids = items.map(function (i) { return i.item_id; });

    if (on.meta && window.fbq) {
      if (META[name]) {
        window.fbq('track', META[name], ids.length
          ? { content_ids: ids, content_type: 'product', value: params.value, currency: 'COP' } : {});
      } else if (viewContent) {
        window.fbq('track', 'ViewContent', { content_name: params.section });
      }
    }

    if (on.tiktok && window.ttq) {
      if (TIKTOK[name]) {
        window.ttq.track(TIKTOK[name], ids.length ? {
          contents: items.map(function (i) { return { content_id: i.item_id, content_name: i.item_name, price: i.price, quantity: 1 }; }),
          content_type: 'product', value: params.value, currency: 'COP'
        } : {});
      } else if (viewContent) {
        window.ttq.track('ViewContent', { content_id: params.section });
      }
    }
  }

  function flush() {
    var dl = window.dataLayer || [];
    for (; cursor < dl.length; cursor++) {
      if (dl[cursor] && dl[cursor]._alfela) forward(dl[cursor]);
    }
  }
  document.addEventListener('alfela:track', function () { if (loaded) flush(); });

  /* ------------------------------------------------ Aviso de cookies --- */
  var bannerEl = null;

  function hideBanner() {
    if (bannerEl) { bannerEl.remove(); bannerEl = null; }
  }

  function decide(value) {
    var previous = getConsent();
    setConsent(value);
    hideBanner();
    if (value === 'granted') loadVendors();
    // Retirar un permiso ya dado: recargar para que no quede ningún script de terceros activo
    else if (previous === 'granted' && loaded) location.reload();
  }

  function showBanner() {
    if (bannerEl) return;
    bannerEl = document.createElement('section');
    bannerEl.setAttribute('aria-label', 'Aviso de cookies');
    bannerEl.className = 'on-dark fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-[55] mx-auto max-w-xl rounded-card bg-navy p-4 text-white shadow-2xl sm:p-5';
    bannerEl.innerHTML =
      '<p class="text-body-sm text-cream/90">Usamos cookies de analítica para saber qué funciona en la tienda y mejorarla. ' +
      'Solo las activamos si aceptas. <a class="font-bold text-white underline underline-offset-2" href="privacidad.html#sitio-web">Más información</a></p>' +
      '<div class="mt-3 grid grid-cols-2 gap-3">' +
      '<button type="button" class="btn border border-white/40 text-white hover:bg-white/10" data-consent="denied">Rechazar</button>' +
      '<button type="button" class="btn btn-sky" data-consent="granted">Aceptar</button>' +
      '</div>';
    bannerEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-consent]');
      if (b) decide(b.getAttribute('data-consent'));
    });
    document.body.appendChild(bannerEl);
  }

  // Enlace "Preferencias de cookies" del footer: visible solo si hay analítica
  var prefsItem = document.querySelector('[data-cookie-prefs-item]');
  if (prefsItem) prefsItem.hidden = false;
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-cookie-prefs]')) showBanner();
  });

  var consent = getConsent();
  if (consent === 'granted') loadVendors();
  else if (consent !== 'denied') showBanner();
})();
