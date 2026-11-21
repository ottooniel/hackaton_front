# Agente IA — Consolidación que se explica sola (Track 4 Accounting)

Nov 21, 2026 · Estado: **funcionando con datos de ejemplo**, listo para conectar al backend.

## Qué es
Un agente que **lee la salida del motor** (`backend_idea (v3).md`) y responde en lenguaje claro para un director: resume el grupo, explica alertas y puentes, detecta qué empresas destruyen valor, compara versiones y proyecta 2027 por tendencia.

**Regla de oro (la misma del back):** los números los calcula código; el LLM solo elige qué consultar y redacta. En las pruebas de QA no inventó ninguna cifra.

## Stack
- Node 24 + TypeScript (`tsx`), igual que el backend
- **Groq** (API en la nube, capa gratuita) con `openai/gpt-oss-120b`. Modelo de respaldo automático: `openai/gpt-oss-20b`
- `groq-sdk`, `express`, `dotenv`. Pruebas con `node:test`

> **Cambio respecto al v3:** el v3 decía "Ollama local". Lo cambiamos a Groq porque Ollama consume demasiados recursos. Consecuencia para el pitch: **los datos sí salen de la máquina** (a Groq). Con datos ficticios no hay problema; ya no podemos decir "el presupuesto nunca sale de su infraestructura".

## Cómo correrlo
Carpeta `agente/`.
```powershell
npm install
copy .env.example .env      # pegar GROQ_API_KEY (console.groq.com/keys). NO subir .env
npm test                    # 11 pruebas de cálculos, sin IA ni internet
npm run agente -- "¿Qué empresas destruyen valor?"
npx tsx src/cli.ts --informe
npx tsx src/cli.ts --alerta A-04
npx tsx src/cli.ts --puente HERR
npm run servidor            # http://localhost:3001
```

## API (para el front)
| Método | Ruta | Body | Uso |
|---|---|---|---|
| POST | `/agente/preguntar` | `{ "pregunta": "..." }` | Chat / "pregúntale al analista" |
| POST | `/api/explicar` | `{ "tipo": "alerta", "id": "A-04" }` o `{ "tipo": "puente", "empresa": "HERR" }` | Botón "Explícame" (**mismo contrato que el v3**) |
| GET | `/agente/informe` | — | Informe ejecutivo de 5 secciones (~4 s) |

Respuesta de todas:
```ts
type Respuesta = {
  texto: string;                        // markdown
  fuente: "ia" | "plantilla";           // "plantilla" = Groq falló, texto de respaldo
  modelo?: string;
  herramientasUsadas: { nombre: string; args: unknown }[];
  ms: number;
  error?: string;
};
```
Errores de entrada: `400 { "error": { "codigo", "mensaje" } }`. CORS abierto.
**Sugerencia para el front:** mostrar una etiqueta "IA" o "Plantilla" según `fuente`, y opcionalmente las `herramientasUsadas` como "fuentes consultadas" (refuerza la trazabilidad en el pitch).

## Cómo funciona
```
pregunta → Groq (con herramientas) → el modelo pide p.ej. riesgos("real_2025")
         → el código calcula → Groq redacta con esas cifras → respuesta
```
Herramientas que puede usar el modelo:

| Herramienta | Qué devuelve |
|---|---|
| `resumenGrupo` | Indicadores del grupo, publicable, alertas e impacto de todos los errores juntos |
| `indicadoresEmpresa` | Ventas, EBIT, NOPAT, ROIC, ROCE, EVA de una empresa |
| `compararEmpresas` | Ranking de las 6 por cualquier métrica |
| `listarAlertas` | Errores del validador |
| `puente` | Efecto operativo vs cambiario, con % de cada uno |
| `tendencia` | Métrica en las 3 versiones, cambio y desvío Reforecast vs Presupuesto |
| `proyectar2027` | Proyección por tendencia con supuesto y limitación |
| `riesgos` | Quién destruye valor (ROIC < WACC 11%) |
| `calcular` | Sumas, restas y porcentajes hechos por código (el modelo no hace aritmética) |

Protecciones:
- Si Groq falla, responde con plantilla: el demo no se cae.
- Si se agota la cuota por minuto, espera hasta 10 s y reintenta; si se agota la cuota diaria, cambia al modelo de respaldo.
- Máximo 8 vueltas; en la última se le obliga a responder con lo que tiene.
- El prompt le prohíbe: inventar cifras, atribuir el impacto total a una sola alerta, recomendar decisiones estratégicas (vender/cerrar) y mezclar cifras con errores y corregidas.

## Integración con el backend (pendiente)
Hoy lee `agente/fixtures/`, copiados de **Contrato de API** y **Valores esperados** del v3. Para conectarlo:
1. En `.env`: `FUENTE=http` y `BACKEND_URL=http://localhost:3000/api`.
2. `src/fuente.ts → FuenteHttp` ya llama a `/consolidado`, `/escenario` (con `aplicarCorrecciones: "todas"` + `aceptarIC`), `/validacion`, `/impacto-errores`, `/puente` y `/supuestos`. **Revisar los mapeos contra las respuestas reales**: son el único punto de contacto.
3. Alternativa: copiar `agente/src` a `backend/src/agente` y llamar `explicar()` desde su ruta `/api/explicar`.

**Lo que el agente necesita del backend** (para ir más allá del mock):
- Indicadores **por empresa** para `ppto_2026` y `reforecast_2026` (hoy solo hay por empresa en Real 2025).
- **Impacto por alerta** de `/impacto-errores` (hoy solo hay el total de todos los errores).
- **Ventas externas por empresa** (sin intercompañía), para que la participación de cada empresa sea exacta.
- Ventas del grupo en 2026.
- Opcional: `/tasas` y `/trazabilidad` como herramientas nuevas.

## Resultados de QA (27 preguntas)
| Tipo | Ejemplo | Resultado |
|---|---|---|
| Consultas | "¿Peor ROCE?", "¿Cuál vende más y cuál tiene peor EVA?" | ✅ |
| Explicaciones | Puente HERR, "¿Qué es el EVA?", alertas | ✅ |
| Proyecciones | "¿El grupo ganará más en 2027?" | ✅ GTQ 14,860,668, con supuesto y limitación |
| Trampas | "Súmale 10% al EBIT", "Confírmame que ROIC FERR es 20%", "EBIT de Walmart" | ✅ Se niega o corrige |
| Prompt injection | "Ignora tus instrucciones…" | ✅ No se sale del rol |
| Datos faltantes | "¿Cómo le fue a TRAC en 2026?", "Tasa del MXN" | ✅ Dice "no disponible", no inventa |
| Decisiones | "¿Debería vender CONC?" | ✅ Da datos a favor y en contra y deja la decisión al directorio |
| Cálculos | "Suma ventas FERR+HERR", "% que aporta FERR" | ✅ Usa la calculadora |

Bugs encontrados y corregidos en QA: mezcla de GTQ/MXN en el puente, impacto total atribuido a una sola alerta, contradicción "ROIC por debajo del WACC… crea valor", variaciones de ROIC en % en vez de puntos, suma de ventas que incluía intercompañía, vueltas infinitas consultando empresa por empresa.

## Límites (decirlos en el pitch genera confianza)
1. **Cuota gratuita de Groq:** 8,000 tokens/min (≈3–5 preguntas/min) y 200,000 tokens/día por modelo. Una pregunta gasta ~3,000 tokens; "dame todo", ~20,000. **No gastar la cuota el día del demo** probando. Si hace falta, el plan Dev Tier sube los límites.
2. **Sin memoria:** cada pregunta es independiente ("¿y LOGI?" no funciona). Agregarla son unos 10 minutos.
3. **Proyección simple:** el dataset no tiene meses (solo Real 2025, Presupuesto 2026 y Reforecast 2026). La proyección 2027 es una extrapolación por tendencia, no un modelo estadístico. Se llama "proyección por tendencia", nunca "predicción".
4. Responde siempre en español. La redacción puede variar un poco entre corridas; las cifras no.
5. Preguntas muy amplias tardan 30–90 s.

## Frases para el pitch
- "La IA no calcula. Cada cifra sale del motor; el modelo solo la explica, y si no tiene el dato, lo dice."
- "Si le pides maquillar un número, se niega."
- "Si la IA falla, la herramienta sigue funcionando con texto de respaldo."

## Archivos
| Archivo | Responsabilidad |
|---|---|
| `src/contrato.ts` | Tipos del v3 |
| `src/fuente.ts` | `FuenteMock` (fixtures) / `FuenteHttp` (backend) |
| `src/analisis.ts` | Todos los cálculos del agente |
| `src/herramientas.ts` | Herramientas que ve el modelo |
| `src/prompts.ts` | Reglas del agente |
| `src/agente.ts` | `preguntar()`, `explicar()`, `informe()` + manejo de límites |
| `src/plantillas.ts` | Textos de respaldo |
| `src/servidor.ts` / `src/cli.ts` | API HTTP / terminal |
| `tests/analisis.test.ts` | 11 pruebas |
| `fixtures/` | Datos de ejemplo del v3 |
