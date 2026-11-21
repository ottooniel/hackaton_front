import type { EmpresaCodigo, TipoGrafica } from '../shared/types';

/** Qué gráfica armar. grafica null = la pregunta no pide una gráfica (o no es sobre las cifras). */
export interface Plan { grafica: TipoGrafica | null; empresa?: EmpresaCodigo }

const EMPRESAS: EmpresaCodigo[] = ['TRAC', 'AGRO', 'FERR', 'CONC', 'HERR', 'LOGI'];
const empresaEn = (t: string) => EMPRESAS.find((e) => new RegExp(`\\b${e}\\b`, 'i').test(t));

/** Respaldo sin IA. ponytail: palabras clave; lo que no coincide no lleva gráfica en vez de caer a ROIC. */
export function planPorPalabras(pregunta: string): Plan {
  const t = pregunta.toLowerCase();
  const empresa = empresaEn(t);
  if (empresa && /sube|baj|cambi|puente|tasa|peso|por qu[eé]|explica|vari|creci/.test(t)) return { grafica: 'cascada', empresa };
  if (/error|grave|signo|duplic|alerta/.test(t)) return { grafica: 'divergente' };
  if (/puente|tipo de cambio|cambiario/.test(t)) return { grafica: 'cascada', empresa: empresa ?? 'HERR' };
  if (/roic|rinde|rentab|costo de(l)? capital|wacc|\beva\b|valor/.test(t)) return { grafica: 'barras_ref' };
  return { grafica: null };
}

export interface Herramienta { nombre?: unknown; args?: unknown }

/** La gráfica sigue lo que el agente consultó de verdad. undefined = sus herramientas no tienen gráfica propia. */
export function planPorHerramientas(usadas: Herramienta[], pregunta: string): Plan | undefined {
  for (const h of [...usadas].reverse()) {
    const args = (h.args && typeof h.args === 'object' ? h.args : {}) as Record<string, unknown>;
    const empresa = typeof args.empresa === 'string' ? EMPRESAS.find((e) => e === String(args.empresa).toUpperCase()) : undefined;
    if (h.nombre === 'puente') return { grafica: 'cascada', empresa: empresa ?? empresaEn(pregunta) ?? 'HERR' };
    if (h.nombre === 'riesgos' || h.nombre === 'compararEmpresas') return { grafica: 'barras_ref' };
    if (h.nombre === 'listarAlertas' || h.nombre === 'impactoPorAlerta') return { grafica: 'divergente' };
  }
  return undefined;
}
