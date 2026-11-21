import type { BarraRef } from '../shared/types';
import { pct } from '../shared/formato';
import styles from './GraficaBarrasRef.module.css';

interface Props {
  items: BarraRef[];
  referencia: number;
  max: number;
}

export function GraficaBarrasRef({ items, referencia, max }: Props) {
  const marca = Math.min(100, (referencia / max) * 100);

  return (
    <figure className={styles.figura}>
      <div className={styles.leyenda}>
        <span className={styles.muestra} />
        Costo del capital {pct(referencia)}
      </div>
      <div className={styles.lista}>
        {items.map((item) => {
          const ancho = Math.min(100, (item.valor / max) * 100);
          const supera = item.valor >= referencia;
          return (
            <div className={styles.fila} key={item.etiqueta}>
              <span className={styles.nombre}>{item.etiqueta}</span>
              <div className={styles.pista}>
                <div
                  className={supera ? styles.barraOk : styles.barraBaja}
                  style={{ width: `${ancho}%` }}
                />
                <span className={styles.linea} style={{ left: `${marca}%` }} />
              </div>
              <span className={styles.valor}>{pct(item.valor)}</span>
            </div>
          );
        })}
      </div>
    </figure>
  );
}
