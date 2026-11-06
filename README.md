# ALFELA · Landing autobronceador Duna

Landing responsive (HTML + Tailwind CSS) construida a partir del proyecto de Stitch
`8390617209320712874`: la versión desktop sale de la pantalla de 1440 px y la móvil de la de 390 px.

```
index.html               ← landing, comentada por secciones
envios-devoluciones.html ← envíos, garantía legal, retracto, reversión del pago
terminos.html            ← términos y condiciones (Ley 1480 de 2011)
privacidad.html          ← tratamiento de datos personales (Ley 1581 de 2012)
assets/css/styles.css    ← CSS compilado y minificado (ya listo, no hace falta compilar para publicar)
assets/js/main.js        ← menú, tallas, compra, menú activo, comparador, vista previa, medición del embudo
assets/js/analytics.js   ← GA4 / Meta / TikTok con aviso de cookies (inactivo hasta poner los IDs)
assets/img/              ← imágenes WebP (d-* desktop, m-* móvil) + og-hero.jpg + favicon.svg
assets/img/resultados/   ← placeholders del antes/después y portadas de video (reemplazar por fotos reales)
src/input.css            ← fuente de Tailwind (componentes .btn, .eyebrow, .accent, .faq-item, .ba, .legal…)
tailwind.config.js       ← tokens de color, tipografía y radios
scripts/build.mjs        ← arma dist/, genera el schema del FAQ y avisa de placeholders pendientes
scripts/optimize-images.mjs ← convierte JPG originales a WebP
scripts/ab-resultado.mjs ← lee el resultado de una prueba A/B (npm run ab)
```

## Placeholders que hay que reemplazar

Búscalos con Ctrl+F. `npm run build` también lista los que queden en cada página.

| Placeholder | Dónde | Qué poner |
|---|---|---|
| `[NÚMERO]` | CTA de WhatsApp (`#whatsapp-cta`), footer, sección de resultados y páginas legales | Celular sin el 57, p. ej. `3001234567` |
| `[PRECIO KIT]` | `data-price` de "Quiero mi kit", del CTA del hero y de la barra móvil (variante b de la prueba "orden") | Precio en pesos sin puntos, p. ej. `119900`. Si cambia, actualiza también los textos "119.900 COP" |
| `[USUARIO_INSTAGRAM]` | Enlace de Instagram del footer | Usuario sin @ |
| `[TU-DOMINIO]` | `canonical`, `og:url`, `og:image` en el `<head>` de cada página | Dominio final, p. ej. `alfela.co` |
| `[NSO-DUNA]` | Tarjeta de Duna, FAQ, CTA, footer y términos | Número de Notificación Sanitaria Obligatoria del INVIMA (formato `NSOC…`) |
| `[RAZÓN SOCIAL]`, `[NIT]`, `[DIRECCIÓN]`, `[CIUDAD]`, `[CORREO]` | Páginas legales | Datos de la empresa (obligatorios para vender en línea, art. 50 Ley 1480) |
| `[TRANSPORTADORA]`, `[DÍAS DESPACHO]`, `[DÍAS ENVÍO]`, `[COSTO ENVÍO]`, `[HORARIO]` | `envios-devoluciones.html` | Condiciones reales de envío y atención |
| `[GARANTÍA]` | `envios-devoluciones.html` | Término de garantía, p. ej. "hasta la fecha de vencimiento impresa en el empaque" |
| `[MEDIOS DE PAGO]`, `[PASARELA]` | `terminos.html` | Cuando conectes la pasarela (Wompi, Bold, Mercado Pago…) |
| `[FECHA VIGENCIA]` | `privacidad.html` | Fecha desde la que rige la política |
| `[CAPAS-SUTIL]`, `[CAPAS-DORADO]`, `[CAPAS-INTENSO]` | Guía de intensidad (`#intensidad`) | Aplicaciones por nivel **según el fabricante**, p. ej. "1 aplicación" |
| `href="#"` + `hidden` | Boletín Dorado (footer, oculto) | URL del formulario cuando exista; quita `hidden` y actualiza la sección 7 de privacidad |
| `[GA4-ID]`, `[META-PIXEL-ID]`, `[TIKTOK-PIXEL-ID]` | `assets/js/analytics.js` | IDs de medición. Opcionales: sin ellos no se carga analítica ni aparece el aviso de cookies |

> **Páginas legales:** son plantillas redactadas con base en la Ley 1480 de 2011, el Decreto 1074
> de 2015 y la Ley 1581 de 2012. Haz que un abogado las revise antes de publicar.

## Contenido pendiente (`data-pending`)

Lo que depende de información real que aún no existe está construido pero **oculto** con el
atributo `data-pending`. No se ve en el sitio ni entra al schema del FAQ:

- Número NSO del INVIMA (tarjeta de Duna, pregunta del FAQ, CTA y footer).
- La calificación 4.9 del hero (solo debe mostrarse si sale de reseñas reales).
- La sección `#resultados` completa: antes/después, videos y reseñas de clientas.
- El número de aplicaciones de cada nivel en la guía de intensidad.

**Vista previa:** abre la página con `?pendientes` al final de la URL (p. ej.
`http://localhost:3000/?pendientes`). Los bloques pendientes aparecen con borde punteado dorado.

**Para publicar un bloque:** llena su contenido y borra el atributo `data-pending`. En la sección de
resultados hay que quitarlo de la `<section>` y de cada tarjeta que llenes; las que no uses, bórralas.

### Reglas para el contenido de clientas

- Solo contenido real, con **autorización escrita** de cada clienta para publicar su foto, video o
  reseña (por WhatsApp sirve, guárdala). Si pide retirarlo, se retira.
- Reseñas: texto tal cual (solo se corrige ortografía), nombre + inicial del apellido.
- Antes y después: sin retoques ni filtros, misma luz, ángulo y distancia. 4:5, 800×1000 px, WebP
  (`npm run images` sirve para convertir). Guárdalas en `assets/img/resultados/`.
- Videos: MP4 H.264 vertical 9:16, 720×1280, máx. ~8 MB, en `assets/video/`; portada WebP y, si
  puedes, subtítulos `.vtt` (en el HTML hay un comentario con la etiqueta `<track>`).
- La sección dice "sin filtros ni retoques": cúmplelo o cambia la frase.

## Experiencia (Fase 3)

- **Visualizador de marquitas** (sección `#tan`): silueta SVG ilustrativa; las copas, la parte de
  abajo y los tirantes cambian con XS/S/M. Una píldora navy se desliza a la talla elegida.
  Todo es CSS (`:has` + `aria-pressed`); `main.js` solo alterna la talla.
- **Guía de intensidad** (`#intensidad`): Sutil · Dorado · Intenso cambian el tono de la silueta y
  el panel de texto. Funciona sin JavaScript (radios + `:has`). Los colores son de referencia.
- **Animaciones:** entrada escalonada del hero (#2, la foto no se anima para no afectar el LCP),
  aparición de grillas al hacer scroll (#5, una sola vez) y píldora de tallas/intensidad (#4).
  Curvas y duraciones están en los tokens `--ease-*` / `--dur-*` de `src/input.css`.
  Con "reducir movimiento" activado no hay desplazamientos: todo aparece en su sitio.

## Optimización (Fase 4)

### Pruebas A/B

| Prueba | a (control) | b |
|---|---|---|
| `hero` | "Ese tono dorado que tanto te gusta, sin exponerte al sol." | "Marquitas y glow dorado, sin un minuto al sol." + párrafo Duna + Tan Alfela |
| `orden` | CTA "Comprar Duna" · barra móvil Duna · kit al final | CTA "Quiero el kit" + "Solo Duna" · barra móvil con el kit · sección del kit justo después del hero |

- **Dónde se configuran:** objeto `TESTS` del script del `<head>` de `index.html`. `active: false` pausa una
  prueba (todas ven la variante a). Si cambias los textos de una prueba en curso, sube `VERSION`.
- **Cómo se ven:** cada bloque lleva `data-ab="prueba:variante"`; la variante se asigna antes del primer
  pintado (sin parpadeo) y se guarda en el navegador, así cada visitante ve siempre la misma.
- **QA:** `?ab-hero=b&ab-orden=b` fuerza variantes. Ese tráfico se marca `traffic_type=internal` y su
  referencia de WhatsApp empieza por `QA-`, para que no contamine los resultados.
- **El texto de la variante b del hero es nuevo:** el cliente debe aprobarlo antes de activar la prueba.

**Métrica principal: clic en comprar (`add_to_cart`) por visitante**, no la venta. Con el tráfico de una
marca que empieza no se alcanza a medir la venta en un tiempo razonable. Visitantes necesarios **por
variante** (95 % de confianza, 80 % de potencia):

| Tasa actual | Para detectar +20 % | +30 % | +50 % |
|---|---|---|---|
| Venta (≈2 %) | 21.109 | 9.798 | 3.826 |
| Clic en comprar (≈8 %) | 4.921 | 2.276 | 882 |
| Clic en comprar (≈12 %) | 3.122 | 1.440 | 555 |

Reglas para que el resultado valga:

1. Define antes la muestra y la fecha de cierre; corre **mínimo 2 semanas completas** (idealmente 4, para
   cubrir dos quincenas de pago) aunque llegues antes a la muestra.
2. No mires el resultado cada día para cortar cuando "gana": eso infla los falsos positivos.
3. Las dos pruebas se asignan por separado, así que pueden correr a la vez y analizarse cada una por su
   lado. Con menos de ~10.000 visitas al mes, mejor una a la vez: primero `hero`.
4. Al cerrar: `npm run ab -- <visitantes A> <clics A> <visitantes B> <clics B>` (usuarias únicas con
   `experiment_view` y con `add_to_cart` de cada variante). Si no hay diferencia significativa, quédate
   con el control.
5. Revisa también ventas e ingreso por variante (abajo): una variante con más clics pero menos ventas no gana.

### Atribución de ventas por WhatsApp

Mientras la compra se cierre por WhatsApp, cada mensaje lleva una referencia, p. ej. `(ref. AB-7K2Q)`:
la **1.ª letra es la variante del hero** y la **2.ª la del orden**; el resto identifica a la visitante.
Quien atiende WhatsApp anota cada venta en una hoja (fecha · ref · productos · valor) y al final se suman
ventas e ingresos por variante. Cuando exista la pasarela, el evento `purchase` reemplaza esto.

### Embudo y eventos

`main.js` deja cada evento en `window.dataLayer` (formato GA4/GTM) con `ab_hero` y `ab_orden`.
`analytics.js` los reenvía a GA4, Meta y TikTok **solo si hay IDs configurados y la usuaria aceptó las
cookies**; los eventos previos al "Aceptar" en esa misma visita también se envían.

| Paso del embudo | Evento | Parámetros clave |
|---|---|---|
| 1. Llega | `page_view` (GA4) · `experiment_view` | `experiment_id`, `variant_id` |
| 2. Ve la oferta | `section_view` | `section`: hero, productos, tan, ritual, intensidad, kit, faq… |
| 3. Explora | `select_size`, `select_intensity`, `elegir_talla`, `faq_open`, `compare_interact`, `video_play` | `size`, `level`, `question` |
| 4. Intención de compra | `add_to_cart` | `items`, `value`, `currency`, `placement` (hero, productos, kit, barra_movil…) |
| 5. Abre la compra | `whatsapp_click` (`reason`: compra/consulta/compartir_resultado) · `begin_checkout` con pasarela | `ref`, `placement` |
| 6. Compra | hoja de ventas por ref → `purchase` cuando exista la pasarela | — |

Meta y TikTok reciben solo eventos estándar: `ViewContent` (vio productos o kit), `AddToCart`,
`InitiateCheckout` y `Contact` (WhatsApp).

**Configuración en GA4** (una vez):
- *Admin → Definiciones personalizadas*: crea dimensiones de evento para `ab_hero`, `ab_orden`,
  `placement`, `section`, `reason`, `experiment_id` y `variant_id`.
- *Admin → Eventos*: marca `add_to_cart` y `whatsapp_click` como eventos clave.
- *Admin → Filtros de datos*: activa el filtro de "Tráfico interno" (usa `traffic_type = internal`).
- *Explorar → Exploración de embudo*: pasos `section_view` (section = productos) → `add_to_cart` →
  `whatsapp_click` (reason = compra), con desglose por `ab_hero` o `ab_orden`. Una segunda exploración
  con `section_view` por `section` muestra en qué parte de la página se va la gente.

### Revisión del embudo actual

Sin tráfico todavía no hay números que revisar; esta es la revisión del recorrido en el código.

**Corregido en esta fase**
- El contador de la bolsa del header mostraba siempre "0" (no hay bolsa): oculto hasta que exista.
- "Comprar" de la tarjeta de Tan Alfela compraba sin talla: ahora es "Elegir talla" y lleva al selector.
- "Boletín Dorado" era un enlace muerto: oculto hasta que exista el formulario.
- Las ventas por WhatsApp no se podían atribuir: ahora llevan referencia de variante.
- (Fase 3) La barra móvil repetía el CTA que ya estaba en pantalla.

**Pendiente, en orden de impacto**
1. **La compra termina en WhatsApp.** Cada venta depende de que alguien conteste, y la venta no se puede
   medir sola. Es la fuga más probable: conectar la pasarela (Wompi o Bold, con PSE y Nequi).
2. **Precio del kit sin confirmar** (`[PRECIO KIT]`): los clics en el kit llegan sin valor y la variante b
   del orden muestra "119.900 COP" en el CTA principal.
3. **Sin prueba social visible**: reseñas, fotos y la calificación siguen ocultas hasta tener contenido real.
4. **"Pagos seguros en línea"** (sección final): confirma que es cierto con el proceso actual por WhatsApp
   (p. ej. link de pago PSE/Nequi); si no, cambia la frase.
5. **Sin captura de contactos**: quien no compra hoy se va sin dejar forma de volver a contactarla
   (boletín o lista de WhatsApp).

## Preguntas frecuentes y schema

Las preguntas viven solo en la sección `#faq` de `index.html`. Al ejecutar `npm run build`, el
script lee cada `<details class="faq-item">` y escribe el JSON-LD `FAQPage` en el `<head>` de
`dist/index.html` (donde está el marcador `<!-- FAQ_SCHEMA -->`). Las preguntas con `data-pending`
se omiten. Respeta la estructura `<summary><span>Pregunta</span>…</summary><div class="faq-a">…</div>`.

Hoy Google solo muestra el FAQ como resultado enriquecido en sitios de gobierno y salud, pero el
schema sigue ayudando a que buscadores y asistentes de IA entiendan las respuestas.

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

`npm run build` compila el CSS, copia a `dist/` las páginas `.html` y `assets/` (así no se
publican `node_modules`, `src` ni `package.json`), genera el schema del FAQ y lista los
placeholders que sigan sin reemplazar.

Después de publicar, reemplaza `[TU-DOMINIO]` y prueba la vista previa con
<https://www.opengraph.xyz> o pegando el enlace en WhatsApp.
