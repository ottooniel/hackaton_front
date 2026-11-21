# diseno.md — Sistema de diseño del front

Prototipo de referencia (fuente de verdad visual): https://claude.ai/artifact/EggzDMyKq6E9Z8rAMozTkf
Archivos del prototipo: `Main.dc.html` (escritorio) y `Movil.dc.html` (teléfono). Los estilos están en línea, se pueden copiar a CSS tal cual.

Paleta inspirada en Grupo AG. Solo colores: sin logo, sin marca, sin nombre en pantalla.

## 1. Stack y reglas de código

- React + Vite + TypeScript (mismo lenguaje que el backend de Steven).
- Sin librería de gráficas. Las 3 gráficas son `div`/SVG simples (ya están resueltas en el prototipo).
- Estado: un `useReducer` + Context en `src/state/`. Sin Redux ni Zustand.
- Estilos: `tokens.css` global (variables) + **CSS Modules por componente** (`Componente.module.css`). Evita choques de clases entre las dos personas.
- Iconos: SVG en línea (los del prototipo). Sin emoji.
- Fuentes (Google Fonts): Montserrat 700/800 para títulos, Inter 400/500/600 para texto.

## 2. Tokens (`src/styles/tokens.css`)

```css
:root {
  /* Interfaz */
  --azul: #29478D;
  --azul-osc: #1D3366;
  --azul-claro: #E8EDF7;
  --azul-borde: #B7C4E3;
  --amarillo: #FBC500;
  --amarillo-osc: #E0AF00;
  --fondo: #EFF2F5;
  --borde: #CDD5DA;
  --tinta: #131517;
  --tinta-2: #272A2E;
  --texto-2: #4B535A;     /* texto secundario */
  --texto-3: #5F666D;     /* notas pequeñas */

  /* Estados (siempre con icono + texto, nunca solo color) */
  --bloq-bg: #FDECEA;  --bloq-tx: #9B1C15;  --bloq-bd: #E9B3AF;
  --adv-bg:  #FFF4CC;  --adv-tx:  #5E4500;  --adv-bd:  #F0CF5A;
  --ok-bg:   #E6F4EC;  --ok-tx:   #17623F;  --ok-bd:   #A9D5BC;
  --neutro-bg: #E4E8EB; --neutro-tx: #4B535A; --neutro-bd: #CDD5DA;

  /* Gráficas (paleta propia, distinta a la interfaz) */
  --g-verde: #0B5F5F;        /* supera / positivo */
  --g-verde-2: #14908C;      /* efecto operativo */
  --g-coral: #F08A4B;        /* debajo / negativo */
  --g-coral-tx: #A8430F;     /* texto sobre fondo claro */
  --g-violeta: #7B61C9;      /* efecto cambiario */
  --g-pizarra: #3D4A57;      /* totales / base */
  --g-pista: #E4E8EB;        /* fondo de la barra */

  /* Agente (identidad propia: amarillo + negro) */
  --ag-chip-bg: #FFF8DB;
  --ag-chip-hover: #FFEFA8;

  --radio-card: 16px;
  --radio-fila: 14px;
  --radio-pill: 999px;
  --sombra-card: 0 1px 2px rgba(19,21,23,.06), 0 12px 32px rgba(41,71,141,.10);
  --sombra-fab: 0 10px 28px rgba(19,21,23,.35);
}
```

Reglas de color:
- Azul = interfaz y acciones principales. Amarillo = acento y botón de mayor prioridad.
- Las gráficas **no** usan azul ni amarillo. Solo la paleta `--g-*`.
- El agente usa amarillo y negro. Sus preguntas sugeridas y su botón "Preguntar" **no** son azules.
- Texto mínimo 4.5:1 de contraste. Ya verificado en los pares de arriba.

## 3. Tipografía

| Uso | Fuente | Tamaño / peso |
|---|---|---|
| Título de página | Montserrat | 44 / 800 (móvil 28) |
| Título de paso | Montserrat | 26 / 800, color `--azul` |
| Cifra grande (hero) | Montserrat | 56 / 800 |
| Cifra de tarjeta | Montserrat | 44 / 800 |
| Etiqueta en mayúsculas | Montserrat | 12 / 700, `text-transform: uppercase` |
| Texto | Inter | 15 / 400, interlineado 1.5 |
| Nota | Inter | 12–13 |

## 4. Estructura de pantalla

Una sola vista, tres pasos. Solo se muestra el contenido del paso activo.

```
Header azul (título + frase)           ← formas decorativas en SVG
Stepper (tarjeta que sube sobre el header, margen -64px)
  1 Carga · 2 Revisa · 3 Entiende
Contenido del paso (tarjetas)
Pie: nota + "Reiniciar la demostración"
[Botón flotante del agente]  [Sidebar del agente cuando está abierto]
```

- Contenedor: `max-width: 1160px`, padding lateral 28px.
- Paso 2 y 3 se habilitan según el estado (ver sección 7).

### Paso 1 · Carga
Zona grande para soltar archivos (borde punteado de 3px azul, fondo `#F4F7FC`), `<input type="file" multiple accept=".xlsx,.xls,.csv">` oculto visualmente pero enfocable dentro de un `<label>`. Debajo, 7 casillas ("Supuestos", TRAC, AGRO, FERR, CONC, HERR, LOGI) que pasan a verde con check cuando llegan. Botón amarillo "Probar con datos de ejemplo".

### Paso 2 · Revisa
Barra de progreso, píldora de estado (Bloqueado / Listo para publicar), botón amarillo "Corregir todo lo corregible", lista de errores como filas de una línea. Tocar la fila la abre y muestra Qué pasó / Cómo se corrige / Efecto. Botón "Ver el resultado" deshabilitado mientras haya bloqueantes.

### Paso 3 · Entiende
1. Bloque azul grande: "Con los datos tal como llegaron" (tachado) → "EBIT del grupo, corregido".
2. Tres tarjetas: ROIC (con medidor), EVA, "Cómo se llega al total".
3. Tarjeta "¿Quieres entender algo más?" que abre el agente.

### Agente (flotante + sidebar)
- Botón circular amarillo de 68px, borde negro 3px, abajo a la derecha, con etiqueta al pasar el cursor.
- Sidebar de 440px por la derecha con fondo oscuro de cabecera, preguntas sugeridas en columna, conversación, caja de texto fija abajo.
- Si el consolidado sigue bloqueado, el sidebar muestra un aviso y un botón "Ir a revisar".
- En móvil, el sidebar es una hoja a pantalla completa y el botón sube a `bottom: 80px` (sobre la barra inferior).

## 5. Componentes (nombre → qué hace)

| Componente | Archivo | Notas |
|---|---|---|
| `Boton` | `ui/Boton.tsx` | variantes: `primario` (azul), `amarillo`, `contorno`, `oscuro`; tamaños `m`, `s`; pill |
| `Chip` | `ui/Chip.tsx` | tonos: `bloq`, `adv`, `ok`, `info`, `neutro`; icono opcional |
| `Termino` | `ui/Termino.tsx` | tooltip accesible: botón con subrayado punteado + `role="tooltip"`; abre con hover y foco |
| `Tarjeta` | `ui/Tarjeta.tsx` | blanca, radio 16, sombra |
| `Shell` | `shell/Shell.tsx` | header, stepper, pie, monta el paso activo y el agente |
| `Stepper` | `shell/Stepper.tsx` | 3 botones, `aria-current="step"`, deshabilita 2 y 3 según estado |
| `Dropzone` | `carga/Dropzone.tsx` | arrastrar/elegir, llama `onArchivos(files)` |
| `SlotsArchivos` | `carga/SlotsArchivos.tsx` | las 7 casillas |
| `FilaError` | `revision/FilaError.tsx` | fila expandible con acciones |
| `ProgresoRevision` | `revision/ProgresoRevision.tsx` | barra + píldora de estado |
| `HeroAntesDespues` | `resultado/HeroAntesDespues.tsx` | bloque azul |
| `TarjetaRoic`, `TarjetaEva`, `TarjetaTotal` | `resultado/…` | las 3 tarjetas |
| `AgenteFab` | `agente/AgenteFab.tsx` | botón flotante |
| `AgenteSidebar` | `agente/AgenteSidebar.tsx` | panel, chips, conversación, formulario |
| `GraficaBarrasRef` | `graficas/GraficaBarrasRef.tsx` | barras con línea de referencia (ROIC vs 11%) |
| `GraficaCascada` | `graficas/GraficaCascada.tsx` | puente de 4 barras |
| `GraficaDivergente` | `graficas/GraficaDivergente.tsx` | barras a izquierda/derecha de un eje central |

Las 3 gráficas reciben **datos por props** (ver `contenido.md`, sección Contrato). No llaman a la API. Así las puede construir una persona sin depender de nadie.

## 6. Reglas de las gráficas

- Colores solo de `--g-*`. Cada barra tiene etiqueta directa con su valor (no depender de la leyenda ni del color).
- Barras redondeadas (999px en horizontales, 6px en cascada).
- Cascada: eje cortado (empieza en 2.20 M) y se avisa con una nota bajo la gráfica. Calcular alturas con la fórmula `((valor - MIN) / SPAN) * ALTO`.
- Divergente: línea central de 2px; negativos a la izquierda, positivos a la derecha.
- Línea de referencia (costo del capital): 3px, color `--tinta`.

## 7. Estados que hay que cubrir

| Estado | Qué se ve |
|---|---|
| Sin archivos | Paso 1 activo. Pasos 2 y 3 deshabilitados |
| Archivos cargados | Paso 2 se habilita y se abre solo |
| Con bloqueantes | Paso 3 deshabilitado. Píldora "Bloqueado: faltan N" |
| Todo resuelto | Píldora verde. Botón "Ver el resultado" activo |
| Agente pensando | Tres puntos animados + "Armando la gráfica…" (≈900 ms) |
| Error de red / backend caído | Aviso simple y botón "Usar datos de ejemplo" (mock) |

Cada acción del usuario (corregir, aceptar diferencia, cambiar de versión) se anota en la bitácora (arreglo en memoria en el front).

## 8. Responsive

- El contenedor es fluido. Las tarjetas usan `flex-wrap: wrap` con `flex: 1 1 300px`.
- Bajo 640px: stepper pasa a barra inferior fija con 3 pestañas (ver `Movil.dc.html`); encabezado reducido; el sidebar del agente es hoja completa.
- Las tablas ya no existen. No hay scroll horizontal salvo el bloque `pre` del JSON del agente.
- Objetivos táctiles de al menos 44px.

## 9. Accesibilidad (mínimos)

- Todo lo clicable es `<button>` o `<a>`. Nunca `div` con `onClick`.
- Iconos solos con `aria-label`. Decorativos con `aria-hidden="true"`.
- Estados con icono y texto, no solo color.
- Foco visible: contorno de 3px `--tinta`.
- Tooltips: abren con foco de teclado y no solo con hover.
- El sidebar del agente tiene `role="dialog"` y `aria-label`; el botón de cerrar tiene `aria-label`.
- Sin atajos de teclado globales.