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
- No instalar dependencias nuevas sin avisar al equipo.

Comandos: `npm run dev` (desarrollo), `npm run build` (compilar y revisar tipos), `npm run lint`.

## Quién edita qué (MUY IMPORTANTE)

Somos dos personas en el front. **Antes de editar cualquier archivo, corre `git branch --show-current`.**

| Rama | Persona | Puede editar |
|---|---|---|
| `a/...` | A (Otto) | `src/shell/`, `src/carga/`, `src/revision/`, `src/ui/`, `src/state/`, `src/api/`, `src/styles/`, `src/shared/`, `App.tsx`, `main.tsx` |
| `b/...` | B | `src/resultado/`, `src/agente/`, `src/graficas/` |

Reglas:
- Nunca edites una carpeta que no sea de la persona de tu rama. Si la tarea lo exige, detente y dilo.
- `src/shared/types.ts`, `mock.ts`, `glosario.ts` y `styles/tokens.css` son contratos compartidos: solo los edita A, y cualquier cambio se avisa antes.
- B recibe datos por props y por el hook `useApp()`. No importa nada de las carpetas de A salvo `ui/`, `shared/` y `tokens.css`.
- `App.tsx` solo importa `Paso3` desde `./resultado` y `Agente` desde `./agente`. Mantener esos nombres.
- Git: commits chicos con prefijo (`a: …`, `b: …`), `git pull --rebase origin main` antes de subir, nunca `push --force`, nunca subir directo a `main` salvo el arranque de A.

## Estructura

```
src/
  shell/        Shell, Stepper, header, pie            (A)
  carga/        Dropzone, SlotsArchivos                (A)
  revision/     FilaError, ProgresoRevision            (A)
  resultado/    HeroAntesDespues, Tarjetas, Paso3      (B)
  agente/       AgenteFab, AgenteSidebar, Agente       (B)
  graficas/     GraficaBarrasRef, GraficaCascada,
                GraficaDivergente                      (B)
  ui/           Boton, Chip, Termino, Tarjeta          (A)
  state/        useApp(), reducer, context             (A)
  api/          client.ts, adapters.ts                 (A)
  shared/       types.ts, mock.ts, glosario.ts         (A, contrato)
  styles/       tokens.css, base.css                   (A)
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
- Los endpoints están en `docs/contenido.md` (sección 7). Si el backend falla, caer al mock sin mostrar un error técnico (flag `USAR_MOCK`).
- El agente solo elige entre 3 gráficas (`barras_ref`, `cascada`, `divergente`) y redacta una frase. El respaldo por palabras clave (`detectarGrafica`) debe seguir funcionando sin backend.

## Cómo trabajar

- Cambios mínimos y enfocados. No refactorizar ni reformatear archivos que no son parte de la tarea.
- Antes de dar algo por terminado: `npm run build` sin errores de tipos y revisar que se vea igual que el prototipo.
- TypeScript estricto: sin `any`. Tipos de `shared/types.ts`.
- No dejar `console.log` ni código comentado.
- Hora límite de funciones: 1:30 pm. Después solo se corrigen errores y se pule.
- Ante la duda sobre un dato, un texto o quién edita qué: preguntar en lugar de adivinar.