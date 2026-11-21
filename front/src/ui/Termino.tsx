import { useId, type ReactNode } from 'react';
import { glosario, type ClaveGlosario } from '../shared/glosario';
import css from './Termino.module.css';

interface Props {
  clave: ClaveGlosario;
  children: ReactNode;          // texto visible, p. ej. "EBIT"
  alinear?: 'izq' | 'der';      // 'der' cuando el término está cerca del borde derecho
}

// Abre con hover y con foco de teclado (CSS :focus-within), no solo con hover.
export function Termino({ clave, children, alinear = 'izq' }: Props) {
  const id = useId();
  return (
    <span className={css.termino}>
      <button type="button" className={css.boton} aria-describedby={id}>{children}</button>
      <span id={id} role="tooltip" className={`${css.tip} ${alinear === 'der' ? css.der : ''}`}>{glosario[clave]}</span>
    </span>
  );
}
