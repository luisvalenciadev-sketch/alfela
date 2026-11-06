// Prepara dist/ para publicar. Se ejecuta después de compilar el CSS:  npm run build
//  1. Copia las páginas .html de la raíz y la carpeta assets/
//  2. Genera el JSON-LD FAQPage de index.html a partir de la sección #faq
//  3. Avisa de los [PLACEHOLDERS] que siguen sin reemplazar
import { cp, rm, mkdir, readFile, writeFile, readdir } from 'node:fs/promises';

const out = 'dist';
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp('assets', `${out}/assets`, { recursive: true });

const pages = (await readdir('.')).filter((f) => f.endsWith('.html'));
const pending = [];

for (const page of pages) {
  let html = await readFile(page, 'utf8');
  if (page === 'index.html') html = injectFaqSchema(html);
  await writeFile(`${out}/${page}`, html);

  const found = findPlaceholders(html);
  if (found.length) pending.push(`  ${page}: ${found.join(', ')}`);
}

console.log(`✓ dist/ listo para publicar (${pages.join(', ')})`);
if (pending.length) {
  console.warn('\n⚠ Placeholders sin reemplazar (búscalos con Ctrl+F antes de salir a producción):');
  console.warn(pending.join('\n'));
}

// ---------------------------------------------------------------------------

function injectFaqSchema(html) {
  const marker = '<!-- FAQ_SCHEMA -->';
  if (!html.includes(marker)) {
    console.warn('⚠ index.html no tiene el marcador <!-- FAQ_SCHEMA -->: no se generó el schema del FAQ');
    return html;
  }

  const items = [];
  const source = html.replace(/<!--[\s\S]*?-->/g, ''); // ignora ejemplos dentro de comentarios
  const detailsRe = /<details class="faq-item"([^>]*)>([\s\S]*?)<\/details>/g;
  for (const [, attrs, body] of source.matchAll(detailsRe)) {
    if (/\bdata-pending\b/.test(attrs)) continue; // pendientes: ni visibles ni en el schema
    const q = body.match(/<summary[^>]*>\s*<span[^>]*>([\s\S]*?)<\/span>/);
    const a = body.match(/<div class="faq-a"[^>]*>([\s\S]*)<\/div>/);
    if (!q || !a) {
      console.warn('⚠ Una pregunta del FAQ no sigue la estructura esperada y se omitió del schema');
      continue;
    }
    items.push({
      '@type': 'Question',
      name: toText(q[1]),
      acceptedAnswer: { '@type': 'Answer', text: toText(a[1]) },
    });
  }

  const schema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items };
  // < evita que un "</script>" dentro de una respuesta cierre la etiqueta
  const json = JSON.stringify(schema, null, 2).replace(/</g, '\\u003c');
  console.log(`✓ FAQPage: ${items.length} preguntas en el schema`);
  return html.replace(marker, `<script type="application/ld+json">\n${json}\n</script>`);
}

function toText(fragment) {
  return fragment
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/(p|li)>/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function findPlaceholders(html) {
  const visible = html.replace(/<!--[\s\S]*?-->/g, '');
  // Tokens en MAYÚSCULAS entre corchetes, p. ej. [NÚMERO], [NSO-DUNA], [PRECIO KIT]
  const tokens = visible.match(/\[[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ0-9 _-]{2,}\]/g) || [];
  return [...new Set(tokens)];
}
