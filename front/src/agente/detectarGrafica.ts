import { RESPUESTAS_AGENTE } from '../shared/mock';
import type { RespuestaAgente, TipoGrafica } from '../shared/types';
import { frasesCortas } from './frasesCortas';

/** Servicio del agente (docs/respuesta-front.md §1). VITE_AGENTE_URL="" lo apaga: solo respaldo, sin red. */
export const AGENTE_URL: string = import.meta.env.VITE_AGENTE_URL ?? 'https://hackaton-agente.onrender.com';
const ESPERA_MS = 8000;   // acordado con el back; si tarda más, queda el respaldo
const PENSANDO_MS = 900;

/** Despierta el servicio (Render free tarda en arrancar) sin gastar cuota de Groq: cualquier GET basta. */
export const despertarAgente = () => { if (AGENTE_URL) fetch(AGENTE_URL, { method: 'GET' }).catch(() => undefined); };

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

const esTipo = (v: unknown): v is TipoGrafica => v === 'barras_ref' || v === 'cascada' || v === 'divergente';

interface RespuestaServicio { texto?: unknown; fuente?: unknown; grafica?: unknown }

/**
 * POST {AGENTE_URL}/agente/preguntar → { texto (markdown), fuente: 'ia' | 'plantilla', … }.
 * Solo se usa `texto` si fuente === 'ia': la plantilla del agente puede traer un volcado de datos largo.
 * La gráfica y el spec los decide el front (o `grafica` si el agente la manda); los números de la gráfica salen del motor.
 * Sin URL, con error, plantilla o más de 8 s: queda la frase del respaldo sin mostrar error.
 */
export async function pedirRespuesta(pregunta: string): Promise<RespuestaAgente> {
  const inicio = Date.now();
  const respaldo = detectarGrafica(pregunta);
  let respuesta = respaldo;
  if (AGENTE_URL) {
    try {
      const r = await fetch(`${AGENTE_URL}/agente/preguntar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pregunta }),
        signal: AbortSignal.timeout(ESPERA_MS),
      });
      if (r.ok) {
        const data = (await r.json()) as RespuestaServicio;
        const texto = data.fuente === 'ia' && typeof data.texto === 'string' ? frasesCortas(data.texto) : '';
        if (texto) {
          const grafica = esTipo(data.grafica) ? data.grafica : respaldo.grafica;
          const base = grafica === respaldo.grafica ? respaldo : RESPUESTAS_AGENTE.find((x) => x.grafica === grafica) ?? respaldo;
          respuesta = {
            ...base,
            pregunta,
            texto,
            fuente: 'ia',
          };
        }
      }
    } catch {
      respuesta = respaldo;
    }
  }
  const resta = PENSANDO_MS - (Date.now() - inicio);
  if (resta > 0) await new Promise((resolver) => setTimeout(resolver, resta));
  return respuesta;
}
