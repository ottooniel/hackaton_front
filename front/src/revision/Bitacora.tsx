import { useId, useState } from 'react';
import css from './Bitacora.module.css';

// Lista de lo que hizo el usuario (cargar, corregir, aceptar diferencia, cambiar versión). Vive en memoria.
export function Bitacora({ entradas }: { entradas: string[] }) {
  const [abierta, setAbierta] = useState(false);
  const id = useId();
  return (
    <div className={css.bitacora}>
      <button type="button" className={css.boton} aria-expanded={abierta} aria-controls={id} onClick={() => setAbierta(!abierta)}>
        {abierta ? 'Ocultar la bitácora' : `Ver la bitácora (${entradas.length})`}
      </button>
      {abierta && (
        <ol id={id} className={css.lista}>
          {entradas.length ? entradas.map((e, i) => <li key={i}>{e}</li>) : <li>Todavía no hay acciones.</li>}
        </ol>
      )}
    </div>
  );
}
