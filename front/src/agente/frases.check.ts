// `node src/agente/frases.check.ts`
import assert from 'node:assert/strict';
import { frasesCortas } from './frasesCortas.ts';

const md = '## Resumen\n\n**Cuatro de seis** empresas rinden menos del 11%. El EBIT del grupo es 14.35 M. Solo HERR y FERR lo superan.\n\n- AGRO: 8.20%\n\nCuarta frase.';
assert.equal(frasesCortas(md), 'Cuatro de seis empresas rinden menos del 11%. El EBIT del grupo es 14.35 M. Solo HERR y FERR lo superan.');
assert.equal(frasesCortas('| a | b |\n|---|---|\nHola.'), 'Hola.');
console.info('frases ok');
