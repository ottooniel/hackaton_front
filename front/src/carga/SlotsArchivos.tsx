import { ARCHIVOS_ESPERADOS } from '../shared/mock';
import { IcoCheck, IcoCirculo } from '../ui/iconos';
import css from './SlotsArchivos.module.css';

export function SlotsArchivos({ recibidos }: { recibidos: string[] }) {
  return (
    <div className={css.slots}>
      <span className={css.label}>Esperamos:</span>
      <ul className={css.lista}>
        {ARCHIVOS_ESPERADOS.map((n) => {
          const ok = recibidos.includes(n);
          return (
            <li key={n} className={`${css.slot} ${ok ? css.ok : ''}`}>
              {ok ? <IcoCheck tam={14} /> : <IcoCirculo tam={14} />}
              {n}
              <span className="vh">{ok ? ', recibido' : ', pendiente'}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
