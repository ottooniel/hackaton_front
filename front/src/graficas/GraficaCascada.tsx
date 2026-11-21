import type { PasoPuente } from '../shared/types';
import { miles, millones } from '../shared/formato';
import { Termino } from '../ui';
import styles from './GraficaCascada.module.css';

interface Props {
  pasos: PasoPuente[];
  min: number;
  span: number;
}

const ALTO = 168;

function cifra(v: number) {
  return Math.abs(v) >= 1_000_000 ? millones(v) : miles(v);
}

function cursorAntes(pasos: PasoPuente[], indice: number, min: number) {
  return pasos.slice(0, indice).reduce(
    (cursor, paso) => (paso.tipo === 'total' ? paso.valor : cursor + paso.valor),
    pasos[0]?.valor ?? min,
  );
}

export function GraficaCascada({ pasos, min, span }: Props) {
  const y = (v: number) => ((v - min) / span) * ALTO;

  const barras = pasos.map((paso, i) => {
    const total = paso.tipo === 'total';
    const cursor = cursorAntes(pasos, i, min);
    const inicio = total ? min : cursor;
    const fin = total ? paso.valor : cursor + paso.valor;
    const color = total ? 'var(--g-pizarra)' : i === 1 ? 'var(--g-verde-2)' : 'var(--g-violeta)';
    return { ...paso, inicio, fin, color };
  });

  return (
    <figure className={styles.figura}>
      <div className={styles.lienzo}>
        {barras.map((b) => {
          const base = Math.min(b.inicio, b.fin);
          const techo = Math.max(b.inicio, b.fin);
          return (
            <div className={styles.col} key={b.etiqueta}>
              <span className={styles.cifra}>{cifra(b.valor)}</span>
              <div className={styles.eje} style={{ height: ALTO }}>
                <div
                  className={styles.barra}
                  style={{
                    bottom: y(base),
                    height: Math.max(y(techo) - y(base), 6),
                    background: b.color,
                  }}
                />
              </div>
              <span className={styles.etiqueta}>{b.etiqueta}</span>
            </div>
          );
        })}
      </div>
      <p className={styles.nota}>
        GTQ. El eje empieza en {millones(min)} para que se vea el cambio.{' '}
        <Termino clave="efecto_operativo">Efecto operativo</Termino> y{' '}
        <Termino clave="efecto_cambiario" alinear="der">efecto cambiario</Termino>.
      </p>
    </figure>
  );
}
