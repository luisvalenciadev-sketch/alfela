// Lee el resultado de una prueba A/B (prueba z de dos proporciones, bilateral, 95 %).
//
//   npm run ab -- <visitantes A> <conversiones A> <visitantes B> <conversiones B>
//   npm run ab -- 4920 410 4890 470
//
// "Visitantes" = usuarias únicas expuestas a la variante (evento experiment_view).
// "Conversiones" = usuarias que hicieron la acción medida (p. ej. add_to_cart).
// Úsalo una sola vez, al terminar la prueba con la muestra planeada: mirar el
// resultado cada día y parar cuando "gana" infla los falsos positivos.

const [nA, cA, nB, cB] = process.argv.slice(2).map(Number);
if ([nA, cA, nB, cB].some((v) => !Number.isFinite(v) || v < 0) || cA > nA || cB > nB || !nA || !nB) {
  console.error('Uso: npm run ab -- <visitantes A> <conversiones A> <visitantes B> <conversiones B>');
  process.exit(1);
}

// Función de distribución normal estándar (aprox. de Abramowitz-Stegun, error < 1e-7)
function phi(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

const pA = cA / nA;
const pB = cB / nB;
const pooled = (cA + cB) / (nA + nB);
const sePooled = Math.sqrt(pooled * (1 - pooled) * (1 / nA + 1 / nB));
const z = sePooled ? (pB - pA) / sePooled : 0;
const pValue = 2 * (1 - phi(Math.abs(z)));

const diff = pB - pA;
const se = Math.sqrt((pA * (1 - pA)) / nA + (pB * (1 - pB)) / nB);
const lo = diff - 1.96 * se;
const hi = diff + 1.96 * se;

// Efecto mínimo detectable (80 % de potencia) con esta muestra y la tasa de A
const mde = (1.96 + 0.8416) * Math.sqrt(2 * pA * (1 - pA) / Math.min(nA, nB));

const pct = (v) => (v * 100).toFixed(2) + ' %';
const pts = (v) => (v >= 0 ? '+' : '') + (v * 100).toFixed(2) + ' pts';

console.log(`
  A (control)  ${cA} de ${nA}  →  ${pct(pA)}
  B            ${cB} de ${nB}  →  ${pct(pB)}

  Diferencia   ${pts(diff)}  (${pA ? (diff / pA >= 0 ? '+' : '') + ((diff / pA) * 100).toFixed(1) + ' % relativo' : 's/d'})
  IC 95 %      ${pts(lo)}  a  ${pts(hi)}
  Valor p      ${pValue.toFixed(4)}
  Con esta muestra solo se detectan diferencias de ±${(mde * 100).toFixed(2)} pts o más.
`);

if (Math.min(cA, cB, nA - cA, nB - cB) < 10) {
  console.log('  ⚠ Muy pocas conversiones: el resultado no es confiable todavía.\n');
} else if (pValue < 0.05) {
  console.log(`  ✓ Diferencia significativa: gana ${diff > 0 ? 'B' : 'A (control)'}.\n`);
} else {
  console.log('  = Sin diferencia significativa. Si la muestra planeada ya se cumplió, quédate con A (control)\n' +
              '    o con la variante más fácil de mantener: la diferencia, si existe, es menor que el mínimo detectable.\n');
}
