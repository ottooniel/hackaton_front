import { millones } from '../shared/formato';
import { Chip, Tarjeta, Termino } from '../ui';
import { IcoAdv } from '../ui/iconos';
import styles from './TarjetaEva.module.css';

export function TarjetaEva({ eva, ebit }: { eva: number; ebit: number }) {
  const noAlcanza = eva < 0 && ebit > 0;

  return (
    <Tarjeta className={styles.tarjeta}>
      <h3 className={styles.titulo}><Termino clave="eva">EVA</Termino></h3>
      <p className={`${styles.cifra} ${eva < 0 ? styles.negativa : ''}`}>{millones(eva)}</p>
      {noAlcanza && (
        <p className={styles.chip}>
          <Chip tono="bloq" icono={<IcoAdv />}>Hay utilidad, pero no alcanza</Chip>
        </p>
      )}
      <p className={styles.nota}>
        Queda después de pagar el costo del capital. En quetzales.
      </p>
    </Tarjeta>
  );
}
