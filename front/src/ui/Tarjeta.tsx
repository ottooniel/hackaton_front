import type { HTMLAttributes } from 'react';
import css from './Tarjeta.module.css';

export function Tarjeta({ className = '', ...rest }: HTMLAttributes<HTMLElement>) {
  return <section className={`${css.tarjeta} ${className}`} {...rest} />;
}
