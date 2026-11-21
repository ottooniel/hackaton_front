// `node src/agente/frases.check.ts`
import assert from 'node:assert/strict';
import { frasesCortas } from './frasesCortas.ts';
import { planPorHerramientas, planPorPalabras } from './plan.ts';

const md = '## Resumen\n\n**Cuatro de seis** empresas rinden menos del 11%. El EBIT del grupo es 14.35 M. Solo HERR y FERR lo superan.\n\n- AGRO: 8.20%\n\nCuarta frase.';
assert.equal(frasesCortas(md), 'Cuatro de seis empresas rinden menos del 11%. El EBIT del grupo es 14.35 M. Solo HERR y FERR lo superan.');
assert.equal(frasesCortas('| a | b |\n|---|---|\nHola.'), 'Hola.');

// Gráfica del agente: sin tema reconocible no hay gráfica (antes caía siempre a ROIC).
assert.equal(planPorPalabras('resumeme el libro del principito').grafica, null);
assert.equal(planPorPalabras('¿Qué empresas rinden menos que su costo de capital?').grafica, 'barras_ref');
assert.deepEqual(planPorPalabras('¿Por qué sube el EBIT de HERR?'), { grafica: 'cascada', empresa: 'HERR' });
assert.deepEqual(planPorPalabras('¿por qué baja agro?'), { grafica: 'cascada', empresa: 'AGRO' });
assert.equal(planPorPalabras('¿Qué tan graves eran los errores?').grafica, 'divergente');
assert.deepEqual(planPorHerramientas([{ nombre: 'puente', args: { empresa: 'ferr' } }], ''), { grafica: 'cascada', empresa: 'FERR' });
assert.equal(planPorHerramientas([{ nombre: 'riesgos', args: {} }], '')?.grafica, 'barras_ref');
assert.equal(planPorHerramientas([{ nombre: 'resumen', args: {} }], ''), undefined);
console.info('frases ok');
