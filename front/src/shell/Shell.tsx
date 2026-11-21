import { Paso1 } from '../carga';
import { Paso2 } from '../revision';
import { Paso3 } from '../resultado';
import { Agente } from '../agente';
import { useApp } from '../state/useApp';
import { Stepper } from './Stepper';
import css from './Shell.module.css';

export function Shell() {
  const { paso, reiniciar } = useApp();
  return (
    <div className={css.app}>
      <header className={css.header}>
        <svg aria-hidden="true" className={css.formas} width="420" height="260" viewBox="0 0 420 260" fill="none">
          <circle cx="300" cy="120" r="150" fill="var(--forma-1)" />
          <circle cx="340" cy="160" r="86" fill="var(--forma-2)" />
          <rect x="150" y="196" width="150" height="14" rx="7" fill="var(--amarillo)" />
        </svg>
        <div className={css.encabezado}>
          <p className={css.kicker}>Consolidación presupuestaria</p>
          <h1 className={css.titulo}>Tus números, consolidados y explicados</h1>
          <p className={css.frase}>Sube tus archivos. Revisamos los errores, te mostramos el resultado y respondemos tus preguntas con gráficas.</p>
        </div>
      </header>

      <main className={css.main}>
        <Stepper />
        {paso === 1 && <Paso1 />}
        {paso === 2 && <Paso2 />}
        {paso === 3 && <Paso3 />}
        <footer className={css.pie}>
          <span>Cifras de ejemplo del reto. Ninguna IA modifica los números.</span>
          <button type="button" className={css.reiniciar} onClick={reiniciar}>Reiniciar la demostración</button>
        </footer>
      </main>

      <Agente />
    </div>
  );
}
