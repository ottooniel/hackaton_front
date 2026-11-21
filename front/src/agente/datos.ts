import * as api from '../api/client';
import { IMPACTO_ERRORES, PUENTE_HERR } from '../shared/mock';
import type { BarraDivergente, BarraRef, ConsolidadoGrupo, PasoPuente, RespuestaAgente } from '../shared/types';

const IMPACTO_MAX = 16.49;

export type DatosGrafica =
  | { tipo: 'barras_ref'; items: BarraRef[]; referencia: number; max: number }
  | { tipo: 'cascada'; pasos: PasoPuente[]; min: number; span: number }
  | { tipo: 'divergente'; items: BarraDivergente[]; max: number }
  | { tipo: 'alerta'; titulo: string; texto: string };

/** Eje de la cascada según los pasos de cada empresa: margen de 40% del cambio arriba y abajo. */
function cascada(pasos: PasoPuente[]): DatosGrafica {
  let nivel = 0;
  const niveles = pasos.map((p) => (nivel = p.tipo === 'total' ? p.valor : nivel + p.valor));
  const lo = Math.min(...niveles);
  const hi = Math.max(...niveles);
  const margen = (hi - lo) * 0.4 || Math.abs(hi) * 0.05 || 1;
  const min = Math.floor((lo - margen) / 10_000) * 10_000;
  return { tipo: 'cascada', pasos, min, span: hi + margen - min };
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


const alertaMoneda = (texto: string): DatosGrafica => ({
  tipo: 'alerta',
  titulo: 'No se puede armar el puente',
  texto,
});

/** `consolidado` viene de useApp(): con backend son las cifras del dataset actual, sin backend el mock. */
export async function datosDe(respuesta: RespuestaAgente, consolidado: ConsolidadoGrupo): Promise<DatosGrafica | null> {
  if (!respuesta.grafica) return null;
  if (respuesta.grafica === 'barras_ref') {
    const items = consolidado.empresas.map((e) => ({ etiqueta: e.codigo, valor: e.roic }));
    return { tipo: 'barras_ref', items, referencia: consolidado.wacc, max: 0.2 };
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

  const empresa = respuesta.empresa ?? 'HERR';
  const sinPuente = alertaMoneda(`No se pudo calcular el puente de ${empresa} ahora.`);
  if (api.USAR_MOCK) {
    if (empresa === 'CONC') return alertaMoneda('CONC mezcla monedas en sus filas. Hay que corregir esa alerta antes de ver el puente.');
    return empresa === 'HERR' ? cascada(PUENTE_HERR.pasos) : sinPuente;
  }

  try {
    return cascada((await api.puente(empresa)).pasos);
  } catch (error) {
    if (error instanceof api.ErrorApi && error.codigo === 'MONEDA_MIXTA') {
      return alertaMoneda(textoAlerta(error.detalle, error.message));
    }
    return empresa === 'HERR' ? cascada(PUENTE_HERR.pasos) : sinPuente;
  }
}
