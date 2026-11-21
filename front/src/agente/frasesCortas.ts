/** Markdown del agente → 1 a 3 frases de texto plano para el sidebar. */
export function frasesCortas(md: string, max = 3): string {
  const plano = md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^\s*#{1,6}\s+.*$/gm, ' ')        // títulos fuera
    .replace(/^\s*\|.*\|\s*$/gm, ' ')          // tablas fuera
    .replace(/^\s*([-*+]|\d+\.)\s+/gm, '')     // viñetas
    .replace(/[*_`~]/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  // Corta en punto seguido de espacio y mayúscula/signo, para no partir "14.35 M" ni "9.63%".
  const frases = plano.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ¿¡])/);
  return frases.slice(0, max).join(' ');
}
