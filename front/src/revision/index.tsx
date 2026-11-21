import { useState } from 'react';
import { Boton, Tarjeta } from '../ui';
import { IcoFlecha } from '../ui/iconos';
import { useApp } from '../state/useApp';
import { FilaError } from './FilaError';
import { ProgresoRevision } from './ProgresoRevision';
import css from './Paso2.module.css';

export function Paso2() {
  const { errores, resueltos, pendientesBloq, publicable, corregir, corregirTodo, aceptarDiferencia, ir } = useApp();
  const [abierto, setAbierto] = useState<string | null>(null);
  const hayPorCorregir = errores.some((e) => !e.esIntercompania && !resueltos.includes(e.id));

  return (
    <Tarjeta className={css.paso}>
      <div className={css.cabeza}>
        <div className={css.textos}>
          <h2 className={css.titulo}>Revisa lo que encontramos</h2>
          <p className={css.desc}>Hasta resolver lo marcado como bloqueante, no publicamos el total del grupo. Toca una fila para ver el detalle.</p>
        </div>
        {hayPorCorregir && <Boton variante="amarillo" onClick={corregirTodo}>Corregir todo lo corregible</Boton>}
      </div>

      <ProgresoRevision resueltos={resueltos.length} total={errores.length} pendientes={pendientesBloq} />

      <ul className={css.lista}>
        {errores.map((e) => (
          <li key={e.id}>
            <FilaError
              error={e}
              resuelto={resueltos.includes(e.id)}
              abierto={abierto === e.id}
              onAbrir={() => setAbierto(abierto === e.id ? null : e.id)}
              onCorregir={() => corregir([e.id])}
              onAceptar={() => aceptarDiferencia(e.id)}
            />
          </li>
        ))}
      </ul>

      <div className={css.pie}>
        <span className={css.nota}>Cada corrección queda anotada en la bitácora.</span>
        <Boton disabled={!publicable} onClick={() => ir(3)}>
          Ver el resultado <IcoFlecha tam={18} />
        </Boton>
      </div>
    </Tarjeta>
  );
}
