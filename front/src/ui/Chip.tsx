import type { ReactNode } from 'react';
import css from './Chip.module.css';

interface Props {
  tono: 'bloq' | 'adv' | 'ok' | 'info' | 'neutro';
  icono?: ReactNode;   // SVG decorativo; el texto siempre acompaña
  children: ReactNode;
  className?: string;
}

export function Chip({ tono, icono, children, className = '' }: Props) {
  return <span className={`${css.chip} ${css[tono]} ${className}`}>{icono}{children}</span>;
}
