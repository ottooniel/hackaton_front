import { useState } from 'react';
import { registros } from '../api/client';
import { explicarAlerta } from '../agente/explicar';
import { miles } from '../shared/formato';
import type { ErrorValidacion, Registro, VersionId } from '../shared/types';
import css from './DetalleMotor.module.css';

const VERSION: Record<VersionId, string> = { real_2025: 'Real 2025', ppto_2026: 'Ppto 2026', reforecast_2026: 'Reforecast 2026' };

type Carga<T> = { estado: 'nada' } | { estado: 'cargando' } | { estado: 'listo'; datos: T } | { estado: 'error' };

// Solo con backend: las filas y la explicación usan los ids reales de /validacion.
export function DetalleMotor({ error: e }: { error: ErrorValidacion }) {
  const [filas, setFilas] = useState<Carga<Registro[]>>({ estado: 'nada' });
  const [expl, setExpl] = useState<Carga<string | null>>({ estado: 'nada' });
  const ids = e.filaIds ?? (e.filaId ? [e.filaId] : []);

  const verFilas = () => {
    if (filas.estado !== 'nada' && filas.estado !== 'error') { setFilas({ estado: 'nada' }); return; }
    setFilas({ estado: 'cargando' });
    registros(ids).then((datos) => setFilas({ estado: 'listo', datos })).catch(() => setFilas({ estado: 'error' }));
  };

  const explicar = () => {
    setExpl({ estado: 'cargando' });
    explicarAlerta(e.id).then((datos) => setExpl({ estado: 'listo', datos }));
  };

  return (
    <div className={css.motor}>
      <div className={css.acciones}>
        {ids.length > 0 && (
          <button type="button" className={css.enlace} aria-expanded={filas.estado === 'listo'} onClick={verFilas}>
            {filas.estado === 'listo' ? 'Ocultar filas de origen' : 'Ver filas de origen'}
          </button>
        )}
        {expl.estado !== 'listo' && (
          <button type="button" className={css.enlace} disabled={expl.estado === 'cargando'} onClick={explicar}>
            {expl.estado === 'cargando' ? 'Pensando…' : 'Explícame esto'}
          </button>
        )}
      </div>

      <div aria-live="polite">
        {filas.estado === 'cargando' && <p className={css.nota}>Buscando las filas…</p>}
        {filas.estado === 'error' && <p className={css.nota}>No pudimos traer las filas ahora.</p>}
        {filas.estado === 'listo' && (
          filas.datos.length ? (
            <ul className={css.filas}>
              {filas.datos.map((r) => (
                <li key={r.id}>
                  <span className={css.origen}>{r.archivo} · {r.hoja}, fila {r.fila}{r.version ? ` · ${VERSION[r.version]}` : ''}</span>
                  <span>
                    {r.concepto}: <strong>{miles(r.monto)} {r.moneda}</strong>
                    {r.montoGrupo === null ? ' · sin tasa para pasar a GTQ' : r.moneda === 'GTQ' ? '' : ` → ${miles(r.montoGrupo)} GTQ`}
                  </span>
                </li>
              ))}
            </ul>
          ) : <p className={css.nota}>El motor no encontró filas para esta alerta.</p>
        )}

        {expl.estado === 'listo' && (
          expl.datos
            ? <p className={css.explicacion}>{expl.datos} <span className={css.fuente}>Redactado por IA</span></p>
            : <p className={css.nota}>No pudimos generar la explicación ahora. Revisa «Qué pasó» y «Cómo se corrige».</p>
        )}
      </div>
    </div>
  );
}
