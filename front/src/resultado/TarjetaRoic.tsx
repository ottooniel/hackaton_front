import { GraficaBarrasRef } from '../graficas/GraficaBarrasRef';
import { pct } from '../shared/formato';
import type { FilaEmpresa } from '../shared/types';
import { Tarjeta, Termino } from '../ui';
import styles from './TarjetaRoic.module.css';

interface Props {
  roic: number;
  wacc: number;
  empresas: FilaEmpresa[];
}

export function TarjetaRoic({ roic, wacc, empresas }: Props) {
  const debajo = roic < wacc;
  const items = empresas.map((e) => ({ etiqueta: e.codigo, valor: e.roic }));

  return (
    <Tarjeta className={styles.tarjeta}>
      <h3 className={styles.titulo}><Termino clave="roic">ROIC</Termino></h3>
      <p className={styles.cifra}>{pct(roic)}</p>
      <p className={styles.nota}>
        La línea es el <Termino clave="wacc">costo del capital</Termino> ({pct(wacc)}).
        El grupo queda {debajo ? 'debajo' : 'por encima'}.
      </p>
      <GraficaBarrasRef items={items} referencia={wacc} max={0.2} />
    </Tarjeta>
  );
}
