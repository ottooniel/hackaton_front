import { useApp } from '../state/useApp';
import type { Paso } from '../state/reducer';
import css from './Stepper.module.css';

// Escritorio: tarjeta sobre el header. Móvil (<640px): barra inferior fija, mismo marcado.
export function Stepper() {
  const { paso, cargado, archivos, publicable, pendientesBloq, ir } = useApp();
  const pasos: { n: Paso; titulo: string; sub: string; deshabilitado: boolean; hecho: boolean }[] = [
    { n: 1, titulo: 'Carga', sub: cargado ? `${archivos.length} archivos listos` : 'Sube tus archivos', deshabilitado: false, hecho: cargado },
    {
      n: 2, titulo: 'Revisa',
      sub: !cargado ? 'Errores y diferencias' : publicable ? 'Todo resuelto' : `${pendientesBloq} por resolver`,
      deshabilitado: !cargado, hecho: publicable,
    },
    { n: 3, titulo: 'Entiende', sub: 'Resultado y preguntas', deshabilitado: !publicable, hecho: false },
  ];

  return (
    <nav aria-label="Pasos" className={css.stepper}>
      {pasos.map((p) => {
        const activo = paso === p.n;
        return (
          <button
            key={p.n}
            type="button"
            className={`${css.paso} ${activo ? css.on : ''} ${p.hecho && !activo ? css.hecho : ''}`}
            disabled={p.deshabilitado}
            aria-current={activo ? 'step' : undefined}
            onClick={() => ir(p.n)}
          >
            <span className={css.n}>{p.n}</span>
            <span className={css.textos}>
              <span>{p.titulo}</span>
              <span className={css.sub}>{p.sub}</span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}
