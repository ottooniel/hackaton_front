import { Boton, Tarjeta } from '../ui';
import { useApp } from '../state/useApp';
import { Dropzone } from './Dropzone';
import { SlotsArchivos } from './SlotsArchivos';
import css from './Paso1.module.css';

export function Paso1() {
  const { archivos, subiendo, avisoRed, subirArchivos, cargarEjemplo } = useApp();
  return (
    <Tarjeta className={css.paso}>
      <div className={css.cabeza}>
        <h2 className={css.titulo}>Carga tus archivos</h2>
        <p className={css.desc}>Un archivo de supuestos y uno por empresa. Excel o CSV.</p>
      </div>

      <Dropzone onArchivos={subirArchivos} ocupado={subiendo} />

      {avisoRed && (
        <div className={css.aviso} role="alert">
          <span>No pudimos conectar con el motor de cálculo. Puedes seguir con los datos de ejemplo.</span>
          <Boton tam="s" variante="contorno" onClick={cargarEjemplo}>Usar datos de ejemplo</Boton>
        </div>
      )}

      <SlotsArchivos recibidos={archivos} />

      <div className={css.ejemplo}>
        <Boton variante="amarillo" disabled={subiendo} onClick={cargarEjemplo}>Probar con datos de ejemplo</Boton>
        <span className={css.nota}>Sin archivos a la mano. Cargamos las seis empresas del reto.</span>
      </div>
    </Tarjeta>
  );
}
