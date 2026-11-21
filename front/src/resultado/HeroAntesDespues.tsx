import { millones } from '../shared/formato';
import { Termino } from '../ui';
import styles from './HeroAntesDespues.module.css';

interface Props {
  ebitSinCorregir: number;
  ebitGrupo: number;
}

export function HeroAntesDespues({ ebitSinCorregir, ebitGrupo }: Props) {
  const escondido = ebitGrupo - ebitSinCorregir;

  return (
    <section className={styles.hero}>
      <p className={styles.kicker}>Con los datos tal como llegaron</p>
      <p className={styles.antes}>{millones(ebitSinCorregir)}</p>
      <p className={styles.ahora}>
        <Termino clave="ebit">EBIT</Termino> del grupo, corregido (GTQ)
      </p>
      <p className={styles.cifra}>{millones(ebitGrupo)}</p>
      <p className={styles.frase}>
        Los errores escondían {(Math.abs(escondido) / 1e6).toFixed(2)} millones de utilidad.
        Ahora cada cifra se puede rastrear hasta su fila de origen.
      </p>
    </section>
  );
}
