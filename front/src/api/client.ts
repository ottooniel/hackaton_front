// Cliente del backend v3. Cualquier fallo o demora lanza error; quien llama cae al mock.
import type { BarraDivergente, ConsolidadoGrupo, ErrorValidacion, Puente, VersionId } from '../shared/types';
import {
  aConsolidado, aErrores, aImpacto, aPuente,
  type ConsolidadoCrudo, type ImpactoCrudo, type PuenteCrudo, type ValidacionCruda,
} from './adapters';

/** true → no se llama al backend. Se activa con VITE_USAR_MOCK=true en .env.local */
export const USAR_MOCK = import.meta.env.VITE_USAR_MOCK === 'true';
const BASE: string = import.meta.env.VITE_API_URL ?? 'https://hackaton-back-7z3l.onrender.com/api';
const ESPERA_MS = 40_000;   // Render free tarda ~30 s en despertar

/** Error con la forma del backend: { error: { codigo, mensaje, … } } */
export class ErrorApi extends Error {
  status: number;
  codigo: string;
  detalle: Record<string, unknown>;
  constructor(status: number, codigo: string, mensaje: string, detalle: Record<string, unknown> = {}) {
    super(mensaje);
    this.status = status;
    this.codigo = codigo;
    this.detalle = detalle;
  }
}

async function pedir<T>(ruta: string, init?: RequestInit): Promise<T> {
  const r = await fetch(BASE + ruta, { ...init, signal: AbortSignal.timeout(ESPERA_MS) });
  if (!r.ok) {
    const cuerpo = await r.json().catch(() => null) as { error?: { codigo?: string; mensaje?: string } } | null;
    const e = cuerpo?.error ?? {};
    throw new ErrorApi(r.status, e.codigo ?? 'HTTP_' + r.status, e.mensaje ?? `${ruta} respondió ${r.status}`, e);
  }
  return r.json() as Promise<T>;
}

const post = (body: unknown): RequestInit => ({
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});

/** Despierta el servidor antes de que el usuario lo necesite. */
export const despertar = () => pedir('/health').catch(() => undefined);

export interface ResumenCarga {
  archivos: unknown; faltantes: unknown; totalRegistros: number; alertas: { bloqueantes: number; advertencias: number };
}

/** Reemplaza el dataset en el servidor (para todos). El archivo `00_` de supuestos es obligatorio. */
export function subir(archivos: File[]): Promise<ResumenCarga> {
  const fd = new FormData();
  archivos.forEach((f) => fd.append('archivos', f));
  return pedir('/upload', { method: 'POST', body: fd });
}

export const validacion = async (version: VersionId): Promise<ErrorValidacion[]> =>
  aErrores(await pedir<ValidacionCruda>(`/validacion?version=${version}`));

export const impactoErrores = async (version: VersionId): Promise<{ barras: BarraDivergente[]; ebitSinCorregir: number }> =>
  aImpacto(await pedir<ImpactoCrudo>(`/impacto-errores?version=${version}`));

export const consolidado = async (version: VersionId, ebitSinCorregir: number | null = null): Promise<ConsolidadoGrupo> =>
  aConsolidado(await pedir<ConsolidadoCrudo>(`/consolidado?version=${version}`), ebitSinCorregir);

/**
 * Recalcula sin guardar. `aplicarCorrecciones`: ids de alerta (no intercompañía) o "todas".
 * `aceptarIC`: referencias IC ("IC-2025-05"), no ids de alerta.
 */
export const escenario = async (
  version: VersionId, aplicarCorrecciones: string[] | 'todas', aceptarIC: string[], ebitSinCorregir: number | null = null,
): Promise<ConsolidadoGrupo> =>
  aConsolidado(await pedir<ConsolidadoCrudo>('/escenario', post({ version, aplicarCorrecciones, aceptarIC })), ebitSinCorregir);

/**
 * Puente base + operativo + cambiario = nuevo. Si la empresa tiene moneda mixta (hoy CONC),
 * lanza ErrorApi con codigo 'MONEDA_MIXTA' y `detalle.alerta`: mostrar la alerta en vez del puente.
 */
export const puente = async (
  empresa: string, desde: VersionId = 'real_2025', hasta: VersionId = 'ppto_2026', metrica: 'ebit' | 'ventas' = 'ebit',
): Promise<Puente> =>
  aPuente(await pedir<PuenteCrudo>(`/puente?empresa=${empresa}&metrica=${metrica}&desde=${desde}&hasta=${hasta}`));
