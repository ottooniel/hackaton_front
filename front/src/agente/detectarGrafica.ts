import { RESPUESTAS_AGENTE } from '../shared/mock';
import type { RespuestaAgente } from '../shared/types';
import { frasesCortas } from './frasesCortas';
import { planPorHerramientas, planPorPalabras, type Herramienta, type Plan } from './plan';

/** Servicio del agente (docs/respuesta-front.md §1). VITE_AGENTE_URL="" lo apaga: solo respaldo, sin red. */
export const AGENTE_URL: string = import.meta.env.VITE_AGENTE_URL ?? 'https://hackaton-agente.onrender.com';
const ESPERA_MS = 8000;   // acordado con el back; si tarda más, queda el respaldo
const PENSANDO_MS = 900;

/** Despierta el servicio (Render free tarda en arrancar) sin gastar cuota de Groq: cualquier GET basta. */
export const despertarAgente = () => { if (AGENTE_URL) fetch(AGENTE_URL, { method: 'GET' }).catch(() => undefined); };

const FUERA_DE_TEMA = 'Solo respondo sobre las cifras del grupo: rentabilidad, errores o cambios entre versiones. Prueba con una de las preguntas sugeridas.';

/** Frase y "qué le pidió al motor" para un plan, con los datos que de verdad se van a consultar. */
function armar(pregunta: string, plan: Plan, usadas: Herramienta[], texto?: string): RespuestaAgente {
  const base = RESPUESTAS_AGENTE.find((r) => r.grafica === plan.grafica);
  const empresa = plan.empresa ?? 'HERR';
  const spec: Record<string, unknown> =
    plan.grafica === 'cascada' ? { grafica: 'cascada', datos: `GET /puente?empresa=${empresa}&desde=real_2025&hasta=ppto_2026` }
    : base ? { ...base.spec } : {};
  if (usadas.length) spec.herramientasDelAgente = usadas;
  const respaldo =
    plan.grafica === null ? FUERA_DE_TEMA
    : plan.grafica === 'cascada' && empresa !== 'HERR'
      ? `Así cambia el EBIT de ${empresa} entre Real 2025 y Presupuesto 2026: primero el efecto del negocio y luego el del tipo de cambio.`
      : base!.texto;
  return { pregunta, texto: texto ?? respaldo, grafica: plan.grafica, empresa, spec, ...(texto ? { fuente: 'ia' as const } : {}) };
}

interface RespuestaServicio { texto?: unknown; fuente?: unknown; herramientasUsadas?: unknown }

/**
 * POST {AGENTE_URL}/agente/preguntar → { texto (markdown), fuente: 'ia' | 'plantilla', herramientasUsadas }.
 * - La gráfica sigue las herramientas que usó el agente; si no usó ninguna con gráfica, decide la pregunta.
 * - Sin herramientas y sin tema reconocible: no salió de los números (p. ej. "resúmeme un libro"): no se muestra.
 * - Plantilla, error o más de 8 s: respaldo por palabras clave. Los números de la gráfica siempre salen del motor.
 */
export async function pedirRespuesta(pregunta: string): Promise<RespuestaAgente> {
  const inicio = Date.now();
  const porPalabras = planPorPalabras(pregunta);
  let respuesta = armar(pregunta, porPalabras, []);
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
        const usadas = Array.isArray(data.herramientasUsadas) ? (data.herramientasUsadas as Herramienta[]) : [];
        const texto = data.fuente === 'ia' && typeof data.texto === 'string' ? frasesCortas(data.texto) : '';
        if (texto && (usadas.length || porPalabras.grafica)) {
          respuesta = armar(pregunta, planPorHerramientas(usadas, pregunta) ?? porPalabras, usadas, texto);
        }
      }
    } catch {
      /* queda el respaldo */
    }
  }
  const resta = PENSANDO_MS - (Date.now() - inicio);
  if (resta > 0) await new Promise((resolver) => setTimeout(resolver, resta));
  return respuesta;
}
