// Chequeo de adapters con respuestas reales del backend (src/api/respuestas/): `node src/api/adapters.check.ts`
import assert from 'node:assert/strict';
import { aConsolidado, aErrores, aImpacto, aPuente, aRegistros, num } from './adapters.ts';
import val from './respuestas/validacion.json' with { type: 'json' };
import con from './respuestas/consolidado.json' with { type: 'json' };
import esc from './respuestas/escenario.json' with { type: 'json' };
import imp26 from './respuestas/impacto_ppto2026.json' with { type: 'json' };
import pue from './respuestas/puente_herr.json' with { type: 'json' };
import reg from './respuestas/registros_a03.json' with { type: 'json' };

assert.equal(num('14350000.00'), 14_350_000);
assert.throws(() => num('abc'));

const errores = aErrores(val as never);
assert.equal(errores.length, 6);
const ic = errores.filter((e) => e.esIntercompania);
assert.deepEqual(ic.map((e) => e.referencia).sort(), ['IC-2025-03', 'IC-2025-05']);
assert.equal(ic[0].empresa, 'LOGI y AGRO');

const bloq = aConsolidado(con as never);
assert.equal(bloq.publicable, false);
assert.equal(bloq.ebitGrupo, null);
assert.equal(bloq.empresas.length, 6);
assert.equal(bloq.wacc, 0.11);
assert.equal(bloq.ebitSinCorregir, -386_104.7);
assert.equal(bloq.empresas.find((e) => e.codigo === 'HERR')?.monedaLocal, 'MXN');

assert.deepEqual(aImpacto(imp26 as never).barras.map((b) => b.valor), [6.72, -16.49, -9.77]);

const ok = aConsolidado(esc as never);
assert.equal(ok.publicable, true);
assert.equal(ok.ebitGrupo, 14_350_000);
assert.equal(ok.roicGrupo, 0.0963);
assert.equal(ok.sumaEmpresas, 14_545_000);
assert.equal(ok.diferenciaIC, 195_000);
assert.equal(ok.empresas[0].codigo, 'HERR');   // ordenadas por ROIC

const p = aPuente(pue as never);
assert.deepEqual(p.pasos.map((s) => s.etiqueta), ['EBIT Real 2025', 'Efecto operativo', 'Efecto cambiario', 'EBIT Ppto 2026']);
assert.equal(p.pasos[3].valor, 2_422_365.22);

const filas = aRegistros(reg as never);
assert.equal(filas.length, 3);
const r25 = filas.find((f) => f.version === 'real_2025');
assert.equal(r25?.monto, 1_530_000);
assert.equal(r25?.moneda, 'NIO');
assert.equal(r25?.montoGrupo, null);   // NIO no tiene tasa
assert.ok(errores.every((e) => (e.filaIds?.length ?? 0) > 0));

console.info('adapters ok');
