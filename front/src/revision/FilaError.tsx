import { useState } from 'react';
import type { ErrorValidacion } from '../shared/types';
import { Boton } from '../ui';
import { IcoAdv, IcoBloq, IcoOk } from '../ui/iconos';
import css from './FilaError.module.css';

interface Props {
  error: ErrorValidacion;
  resuelto: boolean;
  abierto: boolean;
  onAbrir: () => void;
  onCorregir: () => void;
  onAceptar: () => void;
}

export function FilaError({ error: e, resuelto, abierto, onAbrir, onCorregir, onAceptar }: Props) {
  const [confirmando, setConfirmando] = useState(false);
  const bloq = !resuelto && e.severidad === 'bloqueante';
  const estado = resuelto
    ? (e.esIntercompania ? 'Diferencia aceptada' : 'Corregido')
    : (bloq ? 'Bloqueante' : 'Advertencia');
  const detalleId = `detalle-${e.id}`;

  return (
    <article className={`${css.fila} ${resuelto ? css.resuelto : bloq ? css.bloq : css.adv}`}>
      <div className={css.cabeza}>
        <button type="button" className={css.abrir} aria-expanded={abierto} aria-controls={detalleId} onClick={onAbrir}>
          {resuelto ? <IcoOk tam={24} color="var(--ok-tx)" etiqueta="Resuelto" />
            : bloq ? <IcoBloq tam={24} color="var(--bloq-tx)" etiqueta="Bloqueante" />
              : <IcoAdv tam={24} color="var(--adv-tx)" etiqueta="Advertencia" />}
          <span className={css.textos}>
            <span className={css.titulo}>{e.titulo}</span>
            <span className={css.meta}>{e.empresa} · {estado}</span>
          </span>
        </button>

        {!resuelto && !e.esIntercompania && <Boton tam="s" onClick={onCorregir}>Corregir</Boton>}
        {!resuelto && e.esIntercompania && !confirmando && (
          <Boton tam="s" variante="contorno" onClick={() => setConfirmando(true)}>Aceptar diferencia</Boton>
        )}
      </div>

      {confirmando && !resuelto && (
        <div className={css.confirmar} role="group" aria-label="Confirmar diferencia">
          <span>¿Aceptas la diferencia entre {e.empresa}? La decisión queda anotada en la bitácora.</span>
          <div className={css.botones}>
            <Boton tam="s" variante="contorno" onClick={() => setConfirmando(false)}>Cancelar</Boton>
            <Boton tam="s" onClick={() => { setConfirmando(false); onAceptar(); }}>Aceptar diferencia</Boton>
          </div>
        </div>
      )}

      {abierto && (
        <div id={detalleId} className={css.detalle}>
          <div className={css.bloque}><span className={css.etq}>Qué pasó</span><p>{e.quePaso}</p></div>
          <div className={css.bloque}><span className={css.etq}>Cómo se corrige</span><p>{e.comoSeCorrige}</p></div>
          <div className={css.bloque}><span className={css.etq}>Efecto</span><p>{e.efecto}</p></div>
        </div>
      )}
    </article>
  );
}
