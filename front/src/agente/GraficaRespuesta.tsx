import { GraficaBarrasRef } from '../graficas/GraficaBarrasRef';
import { GraficaCascada } from '../graficas/GraficaCascada';
import { GraficaDivergente } from '../graficas/GraficaDivergente';
import type { DatosGrafica } from './datos';
import styles from './AgenteSidebar.module.css';

export function GraficaRespuesta({ datos }: { datos: DatosGrafica }) {
  if (datos.tipo === 'alerta') {
    return (
      <div className={styles.alerta} role="alert">
        <p className={styles.alertaTitulo}>{datos.titulo}</p>
        <p>{datos.texto}</p>
      </div>
    );
  }
  if (datos.tipo === 'cascada') {
    return <GraficaCascada pasos={datos.pasos} min={datos.min} span={datos.span} />;
  }
  if (datos.tipo === 'divergente') {
    return <GraficaDivergente items={datos.items} max={datos.max} />;
  }
  return <GraficaBarrasRef items={datos.items} referencia={datos.referencia} max={datos.max} />;
}
