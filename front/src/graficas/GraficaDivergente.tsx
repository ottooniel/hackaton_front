import type { BarraDivergente } from '../shared/types';
import { millones } from '../shared/formato';
import styles from './GraficaDivergente.module.css';

interface Props {
  items: BarraDivergente[];
  max: number;
}

function millonesYa(v: number) {
  const signo = v < 0 ? '−' : '+';
  return `${signo}${Math.abs(v).toFixed(2)} M`;
}

export function GraficaDivergente({ items, max }: Props) {
  return (
    <figure className={styles.figura} role="img" aria-label={`Efecto en el EBIT, GTQ: ${items.map((i) => `${i.etiqueta} ${millones(i.valor * 1e6)}`).join(', ')}`}>
      <div className={styles.lista}>
        {items.map((item) => {
          const ancho = Math.min(100, (Math.abs(item.valor) / max) * 100);
          const negativo = item.valor < 0;
          return (
            <div className={styles.fila} key={item.etiqueta}>
              <span className={styles.nombre}>{item.etiqueta}</span>
              <div className={styles.eje}>
                <div className={styles.lado}>
                  {negativo && <span className={styles.cifraNeg}>{millonesYa(item.valor)}</span>}
                  <div className={styles.pista}>
                    {negativo && <div className={styles.neg} style={{ width: `${ancho}%` }} />}
                  </div>
                </div>
                <span className={styles.centro} />
                <div className={styles.lado}>
                  <div className={styles.pista}>
                    {!negativo && <div className={styles.pos} style={{ width: `${ancho}%` }} />}
                  </div>
                  {!negativo && <span className={styles.cifraPos}>{millonesYa(item.valor)}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </figure>
  );
}
