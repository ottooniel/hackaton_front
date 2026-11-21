// Chequeo de la compuerta y reglas de estado: `node src/state/reducer.check.ts`
import assert from 'node:assert/strict';
import { ERRORES } from '../shared/mock.ts';
import { esPublicable, inicial, pendientesBloq, reducer } from './reducer.ts';

let s = reducer(inicial, { tipo: 'ir', paso: 2 });
assert.equal(s.paso, 1, 'sin archivos no se entra al paso 2');

s = reducer(s, { tipo: 'cargar', archivos: ['Supuestos'], errores: ERRORES, fuente: 'mock' });
assert.equal(s.paso, 2, 'al cargar se abre el paso 2');
assert.equal(pendientesBloq(s), 6);

s = reducer(s, { tipo: 'ir', paso: 3 });
assert.equal(s.paso, 2, 'compuerta cerrada: no se entra al paso 3');

s = reducer(s, { tipo: 'resolver', ids: ['A-01', 'A-02', 'A-03', 'A-04', 'A-05'], nota: 'Corregido' });
assert.equal(pendientesBloq(s), 2, 'corregir todo deja las 2 intercompañía');
assert.equal(esPublicable(s), false);

s = reducer(s, { tipo: 'resolver', ids: ['A-06', 'A-07'], nota: 'Diferencia aceptada' });
assert.equal(esPublicable(s), true);
s = reducer(s, { tipo: 'ir', paso: 3 });
assert.equal(s.paso, 3);
assert.equal(s.bitacora.length, 3);

assert.deepEqual(reducer(s, { tipo: 'reiniciar' }), inicial);
console.info('reducer ok');
