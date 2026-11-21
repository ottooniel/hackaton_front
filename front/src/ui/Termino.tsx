import { useId, useRef, type ReactNode } from 'react';
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
  const tip = useRef<HTMLSpanElement>(null);
  // El tooltip no se sale del contenedor que recorta (sidebar del agente, tarjeta) ni de la pantalla.
  const ajustar = () => {
    const t = tip.current;
    if (!t) return;
    t.style.translate = '0';
    let caja = t.parentElement?.parentElement ?? null;
    while (caja && getComputedStyle(caja).overflowX === 'visible') caja = caja.parentElement;
    const lim = caja?.getBoundingClientRect();
    const izq = Math.max(lim?.left ?? 0, 0) + 8;
    const der = Math.min(lim?.right ?? innerWidth, innerWidth) - 8;
    const r = t.getBoundingClientRect();
    const dx = r.left < izq ? izq - r.left : r.right > der ? der - r.right : 0;
    t.style.translate = `${dx}px 0`;
  };
  return (
    <span className={css.termino} onMouseEnter={ajustar} onFocus={ajustar}>
      <button type="button" className={css.boton} aria-describedby={id}>{children}</button>
      <span ref={tip} id={id} role="tooltip" aria-hidden="true" className={`${css.tip} ${alinear === 'der' ? css.der : ''}`}>{glosario[clave]}</span>
    </span>
  );
}
