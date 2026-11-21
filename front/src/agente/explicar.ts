import { AGENTE_URL } from './detectarGrafica';
import { frasesCortas } from './frasesCortas';

const ESPERA_MS = 15_000;   // lo pide el usuario con un botón: puede esperar más que el sidebar

/**
 * POST {AGENTE_URL}/api/explicar { tipo: 'alerta', id } → { texto, fuente }.
 * Devuelve 2 a 4 frases si la redactó la IA; null si no hay agente, falla, tarda o vino plantilla.
 */
export async function explicarAlerta(id: string): Promise<string | null> {
  if (!AGENTE_URL) return null;
  try {
    const r = await fetch(`${AGENTE_URL}/api/explicar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo: 'alerta', id }),
      signal: AbortSignal.timeout(ESPERA_MS),
    });
    if (!r.ok) return null;
    const data = (await r.json()) as { texto?: unknown; fuente?: unknown };
    return data.fuente === 'ia' && typeof data.texto === 'string' ? frasesCortas(data.texto, 4) || null : null;
  } catch {
    return null;
  }
}
