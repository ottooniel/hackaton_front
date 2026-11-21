import type { ButtonHTMLAttributes } from 'react';
import css from './Boton.module.css';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'amarillo' | 'contorno' | 'oscuro';
  tam?: 'm' | 's';
}

export function Boton({ variante = 'primario', tam = 'm', className = '', type = 'button', ...rest }: Props) {
  return <button type={type} className={`${css.boton} ${css[variante]} ${tam === 's' ? css.s : ''} ${className}`} {...rest} />;
}
