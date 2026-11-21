import * as api from '../api/client';
import { BARRAS_ROIC, CONSOLIDADO, IMPACTO_ERRORES, PUENTE_HERR } from '../shared/mock';
import type { BarraDivergente, BarraRef, PasoPuente, RespuestaAgente } from '../shared/types';

const PUENTE_MIN = 2_200_000;
const PUENTE_SPAN = 250_000;
const IMPACTO_MAX = 16.49;

export type DatosGrafica =
  | { tipo: 'barras_ref'; items: BarraRef[]; referencia: number; max: number }
  | { tipo: 'cascada'; pasos: PasoPuente[]; min: number; span: number }
  | { tipo: 'divergente'; items: BarraDivergente[]; max: number }
  | { tipo: 'alerta'; titulo: string; texto: string };

function empresaPuente(pregunta: string) {
  return /\bconc\b/i.test(pregunta) && !/\bherr\b/i.test(pregunta) ? 'CONC' : 'HERR';
}

function textoAlerta(detalle: Record<string, unknown>, mensaje: string) {
  const alerta = detalle.alerta;
  if (typeof alerta === 'string' && alerta.trim()) return alerta;
  if (alerta && typeof alerta === 'object') {
    const o = alerta as Record<string, unknown>;
    const partes = [o.titulo, o.mensaje, o.quePaso, o.efecto].filter((p): p is string => typeof p === 'string' && p.trim() !== '');
    if (partes.length) return partes.join(' ');
  }
  return mensaje;
}

const puenteEjemplo = (): DatosGrafica => ({
  tipo: 'cascada', pasos: PUENTE_HERR.pasos, min: PUENTE_MIN, span: PUENTE_SPAN,
});

const alertaMoneda = (texto: string): DatosGrafica => ({
  tipo: 'alerta',
  titulo: 'No se puede armar el puente',
  texto,
});

export async function datosDe(respuesta: RespuestaAgente, pregunta: string): Promise<DatosGrafica> {
  if (respuesta.grafica === 'barras_ref') {
    return { tipo: 'barras_ref', items: BARRAS_ROIC, referencia: CONSOLIDADO.wacc, max: 0.2 };
  }

  if (respuesta.grafica === 'divergente') {
    if (!api.USAR_MOCK) {
      try {
        const { barras } = await api.impactoErrores('ppto_2026');
        const tope = Math.max(IMPACTO_MAX, ...barras.map((b) => Math.abs(b.valor)), 1);
        return { tipo: 'divergente', items: barras, max: tope };
      } catch {
        /* el ejemplo sigue sirviendo */
      }
    }
    return { tipo: 'divergente', items: IMPACTO_ERRORES, max: IMPACTO_MAX };
  }

  const empresa = empresaPuente(pregunta);
  if (api.USAR_MOCK) {
    return empresa === 'CONC'
      ? alertaMoneda('CONC mezcla monedas en sus filas. Hay que corregir esa alerta antes de ver el puente.')
      : puenteEjemplo();
  }

  try {
    const puente = await api.puente(empresa);
    return { tipo: 'cascada', pasos: puente.pasos, min: PUENTE_MIN, span: PUENTE_SPAN };
  } catch (error) {
    if (error instanceof api.ErrorApi && error.codigo === 'MONEDA_MIXTA') {
      return alertaMoneda(textoAlerta(error.detalle, error.message));
    }
    if (empresa === 'CONC') {
      return alertaMoneda('No se pudo calcular el puente de CONC.');
    }
    return puenteEjemplo();
  }
}
