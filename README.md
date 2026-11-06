# ALFELA · Landing autobronceador Duna

Landing responsive (HTML + Tailwind CSS) construida a partir del proyecto de Stitch
`8390617209320712874`: la versión desktop sale de la pantalla de 1440 px y la móvil de la de 390 px.

```
index.html               ← página única, comentada por secciones
assets/css/styles.css    ← CSS compilado y minificado (ya listo, no hace falta compilar para publicar)
assets/js/main.js        ← menú, tallas, botones de compra, menú activo
assets/img/              ← 14 imágenes WebP (d-* desktop, m-* móvil) + og-hero.jpg + favicon.svg
src/input.css            ← fuente de Tailwind (componentes .btn, .eyebrow, .accent…)
tailwind.config.js       ← tokens de color, tipografía y radios
scripts/optimize-images.mjs ← convierte JPG originales a WebP
```

## Placeholders que hay que reemplazar

Búscalos con Ctrl+F en `index.html`:

| Placeholder | Dónde | Qué poner |
|---|---|---|
| `[NÚMERO]` | CTA de WhatsApp (`#whatsapp-cta`) y el enlace "Contacto WhatsApp" del footer | Celular sin el 57, p. ej. `3001234567` |
| `[PRECIO KIT]` | `data-price` del botón "Quiero mi kit" | Precio en pesos sin puntos, p. ej. `119900` |
| `[USUARIO_INSTAGRAM]` | Enlace de Instagram del footer | Usuario sin @ |
| `[TU-DOMINIO]` | `canonical`, `og:url`, `og:image` en el `<head>` | Dominio final, p. ej. `alfela.co` |
| `href="#"` | Envíos y devoluciones · Preguntas frecuentes · Boletín Dorado | URL de cada página cuando exista |

El botón de compra con WhatsApp de respaldo toma el número del enlace `#whatsapp-cta`, así que no
hay que cambiarlo en el JS.

## Conectar la pasarela de pago

Cada botón "Comprar" lleva `data-product` (`duna`, `tan-alfela`, `glowe`, `kit`) y `data-price`.
El de Tan Alfela incluye además `data-size` con la talla elegida (XS/S/M). Puedes conectar la pasarela de dos maneras:

```html
<script>
  // Opción A: función global
  window.AlfelaCheckout = ({ product, price, size }) => { /* abrir Wompi, ePayco, Bold… */ };

  // Opción B: escuchar el evento (llama a preventDefault() para desactivar el respaldo de WhatsApp)
  document.addEventListener('alfela:buy', (e) => { e.preventDefault(); console.log(e.detail); });
</script>
```

Mientras no haya pasarela, el clic abre WhatsApp con el mensaje "Hola Alfela, quiero comprar …".

## Ver en local

Necesitas Node.js 18 o superior.

```bash
npm install          # solo la primera vez
npm run dev          # sirve la carpeta en http://localhost:3000
```

También puedes abrir `index.html` con doble clic, aunque un servidor local se parece más al sitio publicado.

Si editas clases de Tailwind en `index.html` o `src/input.css`, recompila el CSS:

```bash
npm run build:css    # una vez
npm run watch:css    # recompila mientras editas
```

## Publicar

### Netlify
- **Arrastrar y soltar:** ejecuta `npm run build` y suelta la carpeta `dist/` en <https://app.netlify.com/drop>.
- **Desde Git:** sube el repo a GitHub, en Netlify elige *Add new site → Import from Git*. Netlify lee
  `netlify.toml` (build `npm run build`, publish `dist`).

### Vercel
```bash
npm i -g vercel
vercel          # vista previa
vercel --prod   # producción
```
O importa el repo en <https://vercel.com/new>. No hace falta configurar nada: `vercel.json` ya define
Build Command `npm run build` y Output Directory `dist`.

`npm run build` compila el CSS y copia a `dist/` solo `index.html` y `assets/`
(así no se publican `node_modules`, `src` ni `package.json`).

Después de publicar, reemplaza `[TU-DOMINIO]` y prueba la vista previa con
<https://www.opengraph.xyz> o pegando el enlace en WhatsApp.
