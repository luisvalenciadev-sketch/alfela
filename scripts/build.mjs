// Copia a dist/ solo los archivos que se publican (index.html + assets/).
// Se ejecuta después de compilar el CSS:  npm run build
import { cp, rm, mkdir } from 'node:fs/promises';

const out = 'dist';
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp('index.html', `${out}/index.html`);
await cp('assets', `${out}/assets`, { recursive: true });
console.log('✓ dist/ listo para publicar');
