// Iconos del prototipo. Decorativos por defecto (aria-hidden); pasar `etiqueta` si van solos.
import type { ReactNode } from 'react';

interface P { tam?: number; etiqueta?: string; color?: string }

function Svg({ tam = 16, etiqueta, color = 'currentColor', ancho = 2, children }: P & { ancho?: number; children: ReactNode }) {
  const a11y = etiqueta ? { role: 'img', 'aria-label': etiqueta } : { 'aria-hidden': true };
  return (
    <svg width={tam} height={tam} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth={ancho}
      strokeLinecap="round" strokeLinejoin="round" style={{ flex: `0 0 ${tam}px` }} {...a11y}>
      {children}
    </svg>
  );
}

export const IcoCheck = (p: P) => <Svg {...p} ancho={2.4}><path d="M3 8.5l3.2 3.2L13 4.8" /></Svg>;
export const IcoCirculo = (p: P) => <Svg {...p}><circle cx="8" cy="8" r="5.5" /></Svg>;
export const IcoBloq = (p: P) => <Svg {...p}><circle cx="8" cy="8" r="6.5" /><path d="M5.5 5.5l5 5M10.5 5.5l-5 5" /></Svg>;
export const IcoAdv = (p: P) => <Svg {...p}><path d="M8 2l6.5 11.5h-13z" /><path d="M8 6.5v3.2M8 11.6v.1" /></Svg>;
export const IcoOk = (p: P) => <Svg {...p}><circle cx="8" cy="8" r="6.5" /><path d="M5 8.2l2 2 4-4.2" /></Svg>;
export const IcoCandado = (p: P) => <Svg {...p}><rect x="3" y="7" width="10" height="7" rx="1" /><path d="M5.5 7V5a2.5 2.5 0 015 0v2" /></Svg>;
export const IcoFlecha = (p: P) => <Svg {...p}><path d="M3 8h10M9 4l4 4-4 4" /></Svg>;
export const IcoCerrar = (p: P) => <Svg {...p}><path d="M3 3l10 10M13 3L3 13" /></Svg>;
