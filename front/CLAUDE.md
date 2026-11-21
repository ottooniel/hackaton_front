# CLAUDE.md — Front de "Consolidación que se explica sola"

Hackathon Open2 Build & Pitch, UVG. Equipo 404 > 200. Track 4 (Contabilidad, reto de consolidación presupuestaria multiempresa).
Este archivo va en la raíz del proyecto de Vite (`front/`). Habla siempre en español.

## Qué es el producto

Una sola vista para cualquier rol financiero. Tres pasos: **1 Carga** (subir archivos), **2 Revisa** (errores y diferencias, con corrección guiada), **3 Entiende** (resultado antes/después y un agente flotante que responde con gráficas). Todo con tooltips en lenguaje llano. Los números los calcula el backend; la IA solo explica y elige el tipo de gráfica, nunca toca una cifra.

Prototipo visual (fuente de verdad): https://claude.ai/artifact/EggzDMyKq6E9Z8rAMozTkf (`Main.dc.html` escritorio, `Movil.dc.html` teléfono).
Detalle en `docs/diseno.md`, `docs/contenido.md` y `docs/fases.md` si existen en el repo. Si no existen, pídelos antes de inventar textos o datos.

## Stack

- React + Vite + TypeScript. Sin librería de gráficas (las 3 gráficas son `div`/SVG).
- Estado: `useReducer` + Context en `src/state/`. No agregar Redux ni Zustand.
- Estilos: `src/styles/tokens.css` global + **CSS Modules** por componente (`X.module.css`). No escribir CSS global nuevo.
- Fuentes: Montserrat (títulos) e Inter (texto), por Google Fonts.
- Iconos: SVG en línea. Nunca emoji.
- No instalar dependencias nuevas.

Comandos: `npm run dev` (desarrollo), `npm run build` (compilar y revisar tipos), `npm run lint`.

## Quién edita qué

Desde el 21 nov 2026 el front lo lleva **una sola persona (Otto)**. Se puede editar cualquier carpeta de `src/`.

Reglas que se mantienen:
- `src/shared/types.ts` es el contrato con el backend: si cambia, revisar `api/adapters.ts` y quien use el tipo.
- `App.tsx` monta `AppProvider` y `Shell`; el Shell importa `Paso3` desde `./resultado` y `Agente` desde `./agente`.
- Git: trabajar en `a/pasos` y unir a `main` cuando algo funcione completo. Commits chicos con prefijo convencional en español (`feat: …`, `fix: …`, `docs: …`, `chore: …`). `git pull --rebase origin main` antes de subir, nunca `push --force`.

## Estructura

```
src/
  shell/        Shell, Stepper, header, pie
  carga/        Paso1, Dropzone, SlotsArchivos
  revision/     Paso2, FilaError, ProgresoRevision, Bitacora
  resultado/    Paso3, HeroAntesDespues, Tarjetas
  agente/       Agente, AgenteFab, AgenteSidebar, detectarGrafica, datos
  graficas/     GraficaBarrasRef, GraficaCascada, GraficaDivergente
  ui/           Boton, Chip, Termino, Tarjeta, iconos
  state/        useApp(), reducer, AppProvider
  api/          client.ts, adapters.ts, respuestas/ (JSON reales para los chequeos)
  shared/       types.ts, mock.ts, glosario.ts, formato.ts
  styles/       tokens.css, base.css
```

## Reglas de diseño

- Colores solo desde variables de `tokens.css`. No escribir hexadecimales sueltos en componentes.
- Azul = interfaz. Amarillo = acento y botón principal. Las **gráficas no usan azul ni amarillo**: solo la paleta `--g-*` (verde azulado, coral, violeta, pizarra).
- El agente usa amarillo y negro. Sus preguntas sugeridas y su botón "Preguntar" no son azules.
- Los estados (bloqueante, advertencia, ok) siempre llevan icono y texto, nunca solo color.
- Todo lo clicable es `<button>` o `<a>`. Nunca `div` con `onClick`. Iconos solos con `aria-label`. Foco visible. Objetivos táctiles de 44px o más.
- Los tooltips usan `<Termino clave="…">` con el texto de `shared/glosario.ts`; deben abrir con foco, no solo con hover.
- El contenedor es fluido (`max-width: 1160px`). En móvil (bajo 640px): barra inferior de pasos y el agente como hoja completa.

## Reglas de datos y textos

- Usar los valores esperados del backend v3 que están en `shared/mock.ts`. **No inventar cifras.** Si falta un dato, dejar un marcador visible como `[monto]` y avisar.
- Montos del backend llegan como cadenas decimales y los porcentajes como fracciones (0.156 = 15.6%). Convertir solo en `api/adapters.ts`; los componentes reciben números.
- Formato: miles con coma (`14,350,000`), negativo con `−`, millones con dos decimales (`14.35 M`), porcentajes con dos decimales (`9.63%`). La moneda del grupo es GTQ.
- Textos en español llano, sin siglas sin explicar. Decir "simulación de escenarios", nunca "predicción". Los textos oficiales están en `docs/contenido.md`.
- Backend: `https://hackaton-back-7z3l.onrender.com/api`. Contrato en `docs/API del motor de consolidación — guía para el front.md` y `docs/respuesta-front.md`. Si el backend falla, caer al mock sin mostrar un error técnico (`VITE_USAR_MOCK=true` fuerza el mock).
- `/upload` y `/reset` cambian los datos para todos. Render tarda ~30 s en despertar.
- Agente IA: `https://hackaton-agente.onrender.com` (`POST /agente/preguntar`, sin `/api`), configurable con `VITE_AGENTE_URL`. Solo se toma su `texto` si `fuente === 'ia'`; la gráfica la elige el front (`detectarGrafica`) y los números salen del motor. Con plantilla, error o más de 8 s, queda el respaldo por palabras clave. La cuota de Groq es mínima: no probar el agente sin necesidad.

## Cómo trabajar

- Cambios mínimos y enfocados. No refactorizar ni reformatear archivos que no son parte de la tarea.
- Antes de dar algo por terminado: `npm run build`, `npm run lint` y los chequeos (`node src/api/adapters.check.ts`, `node src/state/reducer.check.ts`, `node src/agente/frases.check.ts`), y revisar que se vea igual que el prototipo.
- TypeScript estricto: sin `any`. Tipos de `shared/types.ts`.
- No dejar `console.log` ni código comentado.
- Hora límite de funciones: 1:30 pm. Después solo se corrigen errores y se pule.
- Ante la duda sobre un dato o un texto: preguntar en lugar de adivinar.