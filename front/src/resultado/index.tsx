import { AVISO_SIN_CIFRAS } from '../shared/mock';
import { useApp } from '../state/useApp';
import { Boton } from '../ui';
import { HeroAntesDespues } from './HeroAntesDespues';
import styles from './Paso3.module.css';
import { TarjetaEva } from './TarjetaEva';
import { TarjetaRoic } from './TarjetaRoic';
import { TarjetaTotal } from './TarjetaTotal';

export function Paso3() {
  const { consolidado, version, abrirAgente } = useApp();
  const listo = consolidado.publicable
    && consolidado.ebitGrupo != null
    && consolidado.ebitSinCorregir != null
    && consolidado.roicGrupo != null
    && consolidado.evaGrupo != null
    && consolidado.sumaEmpresas != null
    && consolidado.diferenciaIC != null;

  if (version !== 'real_2025') {
    return <p className={styles.aviso}>{AVISO_SIN_CIFRAS}</p>;
  }

  const ebitGrupo = consolidado.ebitGrupo;
  const ebitSinCorregir = consolidado.ebitSinCorregir;
  const roicGrupo = consolidado.roicGrupo;
  const evaGrupo = consolidado.evaGrupo;
  const sumaEmpresas = consolidado.sumaEmpresas;
  const diferenciaIC = consolidado.diferenciaIC;

  if (!listo || ebitGrupo == null || ebitSinCorregir == null || roicGrupo == null || evaGrupo == null || sumaEmpresas == null || diferenciaIC == null) {
    return (
      <p className={styles.aviso}>
        El total del grupo sigue bloqueado. Resuelve los errores bloqueantes para ver el resultado.
      </p>
    );
  }

  return (
    <section className={styles.paso}>
      <h2 className="vh">Resultado y preguntas</h2>
      <HeroAntesDespues ebitSinCorregir={ebitSinCorregir} ebitGrupo={ebitGrupo} />
      <div className={styles.rejilla}>
        <TarjetaRoic roic={roicGrupo} wacc={consolidado.wacc} empresas={consolidado.empresas} />
        <TarjetaEva eva={evaGrupo} ebit={ebitGrupo} />
        <TarjetaTotal sumaEmpresas={sumaEmpresas} diferenciaIC={diferenciaIC} ebitGrupo={ebitGrupo} />
      </div>
      <article className={styles.invita}>
        <h3>¿Quieres entender algo más?</h3>
        <p>Pregúntale al agente. Te responde con una gráfica hecha para tu pregunta.</p>
        <Boton variante="amarillo" onClick={abrirAgente}>
          Abrir el agente
        </Boton>
      </article>
    </section>
  );
}
