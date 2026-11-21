import { Chip } from '../ui';
import { IcoCandado, IcoOk } from '../ui/iconos';
import css from './ProgresoRevision.module.css';

interface Props { resueltos: number; total: number; pendientes: number }

export function ProgresoRevision({ resueltos, total, pendientes }: Props) {
  return (
    <div className={css.progreso}>
      <div className={css.barra}>
        <div
          className={css.pista}
          role="progressbar"
          aria-label="Errores resueltos"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={resueltos}
        >
          <div className={css.relleno} style={{ width: `${total ? (resueltos / total) * 100 : 0}%` }} />
        </div>
        <span className={css.texto}>{resueltos} de {total} resueltos</span>
      </div>
      <span aria-live="polite">
        {pendientes > 0
          ? <Chip tono="neutro" className={css.estado} icono={<IcoCandado />}>Total del grupo bloqueado: faltan {pendientes}</Chip>
          : <Chip tono="ok" className={css.estado} icono={<IcoOk />}>Listo para publicar</Chip>}
      </span>
    </div>
  );
}
