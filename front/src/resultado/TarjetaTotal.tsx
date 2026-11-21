import { miles } from '../shared/formato';
import { Tarjeta, Termino } from '../ui';
import styles from './TarjetaTotal.module.css';

interface Props {
  sumaEmpresas: number;
  diferenciaIC: number;
  ebitGrupo: number;
}

export function TarjetaTotal({ sumaEmpresas, diferenciaIC, ebitGrupo }: Props) {
  return (
    <Tarjeta className={styles.tarjeta}>
      <h3 className={styles.titulo}>Cómo se llega al total</h3>
      <dl className={styles.lista}>
        <div>
          <dt>Suma de las 6 empresas</dt>
          <dd>{miles(sumaEmpresas)}</dd>
        </div>
        <div>
          <dt><Termino clave="intercompania" alinear="der">Diferencia entre empresas del grupo</Termino></dt>
          <dd>{miles(-diferenciaIC)}</dd>
        </div>
        <div className={styles.total}>
          <dt><Termino clave="ebit">EBIT</Termino> del grupo</dt>
          <dd>{miles(ebitGrupo)}</dd>
        </div>
      </dl>
    </Tarjeta>
  );
}
