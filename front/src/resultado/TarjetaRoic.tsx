import { pct } from '../shared/formato';
import { Tarjeta, Termino } from '../ui';
import styles from './TarjetaRoic.module.css';

const MAX = 0.2;   // escala del medidor: 0 a 20 %

// Medidor del ROIC del grupo contra el costo del capital (como el prototipo).
// El ranking por empresa lo muestra el agente con GraficaBarrasRef.
export function TarjetaRoic({ roic, wacc }: { roic: number; wacc: number }) {
  const debajo = roic < wacc;
  const ancho = Math.max(0, Math.min(100, (roic / MAX) * 100));
  const linea = Math.min(100, (wacc / MAX) * 100);

  return (
    <Tarjeta className={styles.tarjeta}>
      <h3 className={styles.titulo}><Termino clave="roic">ROIC</Termino> del grupo</h3>
      <p className={styles.cifra}>{pct(roic)}</p>
      <div className={styles.medidor} role="img" aria-label={`ROIC ${pct(roic)} frente a un costo del capital de ${pct(wacc)}`}>
        <div className={debajo ? styles.barraBaja : styles.barraOk} style={{ width: `${ancho}%` }} />
        <span className={styles.linea} style={{ left: `${linea}%` }} />
      </div>
      <p className={styles.nota}>
        La línea es el <Termino clave="wacc">costo del capital</Termino> ({pct(wacc)}).
        El grupo queda {debajo ? 'debajo' : 'por encima'}.
      </p>
    </Tarjeta>
  );
}
