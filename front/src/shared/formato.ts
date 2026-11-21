// Formato único para cifras (docs/contenido.md, sección 7). Signo menos tipográfico: −
const menos = (v: number) => (v < 0 ? '−' : '');

/** 14350000 → "14,350,000" */
export const miles = (v: number) => menos(v) + Math.abs(Math.round(v)).toLocaleString('en-US');

/** 14350000 → "14.35 M" */
export const millones = (v: number) => menos(v) + (Math.abs(v) / 1e6).toFixed(2) + ' M';

/** 0.0963 → "9.63%" */
export const pct = (v: number) => menos(v) + (Math.abs(v) * 100).toFixed(2) + '%';
