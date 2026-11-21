import { USAR_MOCK } from '../api/client';
import { RESPUESTAS_AGENTE } from '../shared/mock';
import type { RespuestaAgente, TipoGrafica } from '../shared/types';

const BASE = import.meta.env.VITE_API_URL ?? 'https://hackaton-back-7z3l.onrender.com/api';

const CASCADA = /herr|puente|sube|cambio|tasa|peso/i;
const DIVERGENTE = /error|grave|signo|moneda|duplic/i;

export function detectarGrafica(texto: string): RespuestaAgente {
  const limpio = texto.trim();
  const exacta = RESPUESTAS_AGENTE.find(
    (r) => r.pregunta.toLowerCase() === limpio.toLowerCase(),
  );
  if (exacta) return exacta;
  if (CASCADA.test(limpio)) return { ...RESPUESTAS_AGENTE[1], pregunta: limpio };
  if (DIVERGENTE.test(limpio)) return { ...RESPUESTAS_AGENTE[2], pregunta: limpio };
  return { ...RESPUESTAS_AGENTE[0], pregunta: limpio };
}

function esTipo(v: unknown): v is TipoGrafica {
  return v === 'barras_ref' || v === 'cascada' || v === 'divergente';
}

function esRespuesta(v: unknown): v is RespuestaAgente {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.pregunta === 'string'
    && typeof o.texto === 'string'
    && esTipo(o.grafica)
    && typeof o.spec === 'object'
    && o.spec !== null;
}

/** POST /agente, con tope de 3 s. Si no existe o tarda, la frase sale de las palabras clave. */
export async function pedirRespuesta(pregunta: string): Promise<RespuestaAgente> {
  const inicio = Date.now();
  const respaldo = detectarGrafica(pregunta);
  let respuesta = respaldo;
  if (!USAR_MOCK) {
    try {
      const r = await fetch(`${BASE}/agente`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pregunta }),
        signal: AbortSignal.timeout(3000),
      });
      if (r.ok) {
        const data: unknown = await r.json();
        if (esRespuesta(data)) respuesta = { ...data, pregunta: data.pregunta || pregunta };
      }
    } catch {
      respuesta = respaldo;
    }
  }
  const resta = 900 - (Date.now() - inicio);
  if (resta > 0) await new Promise((resolver) => setTimeout(resolver, resta));
  return respuesta;
}
