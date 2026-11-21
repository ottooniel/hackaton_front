# fases.md — Plan de implementación del front para 2 personas

Persona **A** = Otto. Persona **B** = Carlos

## 1. Cómo nos repartimos sin pisarnos

La regla es simple: **cada quien es dueño de carpetas distintas y nadie edita una carpeta ajena.**

| Persona | Carpetas que le pertenecen | Qué construye |
|---|---|---|
| **A** | `src/shell/`, `src/carga/`, `src/revision/`, `src/ui/`, `src/state/`, `src/api/`, `src/styles/`, `src/shared/`, `App.tsx`, `main.tsx` | Estructura general, pasos 1 y 2, kit de botones y chips, estado, conexión con el backend |
| **B** | `src/resultado/`, `src/agente/`, `src/graficas/` | Paso 3, las 3 gráficas, botón flotante y sidebar del agente |

Archivos compartidos (los edita **solo A**; B pide el cambio por chat): `shared/types.ts`, `shared/mock.ts`, `shared/glosario.ts`, `styles/tokens.css`, `state/`, `App.tsx`.

Cómo se conectan sin tocarse:
- `App.tsx` importa solo dos cosas de B: `import { Paso3 } from './resultado'` y `import { Agente } from './agente'`. A crea esas dos carpetas en el arranque con un componente vacío, para que todo compile desde el minuto uno. B reemplaza el contenido, no los nombres.
- B lee el estado con un hook que A deja listo: `useApp()` devuelve `{ consolidado, publicable, version, agenteAbierto, abrirAgente, cerrarAgente }`. Mientras el backend no responde, ese hook devuelve el mock.
- Las gráficas reciben datos por props (ver `contenido.md`). No importan nada de A, salvo `tokens.css` y los tipos.
- Estilos: CSS Modules por componente. No se escribe CSS global fuera de `tokens.css` y `base.css` (de A).
- El kit `ui/` (Boton, Chip, Termino, Tarjeta) lo hace A en los primeros 25 minutos. Mientras tanto B usa `<button>` normales con sus clases; cuando A suba el kit, B cambia a los componentes (cambio de 5 minutos).

## 2. Reglas de git

1. Una sola rama principal: `main`. Nadie sube directo a `main` salvo A con el arranque.
2. Cada quien trabaja en su rama: `a/pasos` y `b/resultado-agente`.
3. Commits chicos y seguidos. Antes de subir: `git pull --rebase origin main`.
4. Se une a `main` en los puntos de integración (abajo) y también cada vez que algo funcione completo. No esperar al final.
5. Si hay conflicto, casi siempre es por tocar una carpeta ajena. Se resuelve quedándose con la versión del dueño de la carpeta.
6. Mensajes de commit: `a: paso 2 filas de error`, `b: cascada con eje cortado`. Así se sabe de quién es cada cosa.
7. Si hace falta cambiar un archivo compartido, se avisa por chat antes de empezar, no después.

## 3. Fases

### Fase 0 — Arranque (11:56 a 12:20)

**A**
- [x] Crear el proyecto Vite + React + TypeScript y subirlo a `main`.
- [x] Copiar `tokens.css` y `base.css` (de `diseno.md`) y cargar las fuentes.
- [x] Crear `shared/types.ts`, `shared/mock.ts` y `shared/glosario.ts` con el contenido de `contenido.md`.
- [x] Crear los esqueletos vacíos de `resultado/` y `agente/` (para que B no espere).
- [x] Crear `state/` con `useApp()` leyendo el mock.
- [x] Avisar a B: "main listo, haz pull".
- [x] Kit `ui/`: Boton, Chip, Termino, Tarjeta.

**B** (empieza de inmediato, sin esperar el arranque)
- [ ] Leer `diseno.md` y `contenido.md`. Abrir el prototipo en el enlace.
- [ ] Construir `GraficaBarrasRef`, `GraficaCascada` y `GraficaDivergente` como componentes puros con props (se pueden probar en una página suelta con los datos del mock).

**Salida de la fase:** el repo corre en las dos máquinas y las gráficas se ven con datos de ejemplo.

### Fase 1 — Pantallas (12:20 a 12:55)

**A**
- [x] `Shell`: header con formas, stepper (3 pasos) y pie.
- [x] Paso 1: `Dropzone` y `SlotsArchivos`, botón "Probar con datos de ejemplo".
- [x] Paso 2: `FilaError` expandible, `ProgresoRevision`, "Corregir todo lo corregible", "Aceptar diferencia", compuerta que habilita el paso 3.
- [x] Reglas de estado de `diseno.md` sección 7.

**B**
- [ ] Paso 3: `HeroAntesDespues`, `TarjetaRoic`, `TarjetaEva`, `TarjetaTotal`, tarjeta "¿Quieres entender algo más?".
- [ ] `AgenteFab` y `AgenteSidebar`: chips, conversación, estado "pensando", formulario, enlace con el JSON, estado bloqueado.
- [ ] `detectarGrafica()` y las 3 respuestas del agente con datos del mock.

**Primer punto de integración (12:35):** A y B suben a `main` lo que tengan, aunque esté a medias. Comprobar que el proyecto sigue compilando.

**Segundo punto (12:55):** `main` muestra el flujo completo con datos de ejemplo: cargar → corregir → ver resultado → abrir el agente.

### Fase 2 — Backend y móvil (12:55 a 1:30)

**A**
- [x] `api/client.ts` y `api/adapters.ts` (cadenas decimales → números, fracciones → porcentajes).
- [x] Conectar `POST /upload`, `GET /validacion`, `POST /escenario`, `GET /consolidado`. Si un endpoint falla, el mock sigue funcionando (flag `USAR_MOCK`). Adapters probados con respuestas reales (`node src/api/adapters.check.ts`).
- [x] Bitácora en memoria (lista de acciones).
- [x] Versión móvil del shell: barra inferior de pasos.

**B**
- [ ] Conectar `GET /puente` y `GET /impacto-errores` a las gráficas del agente.
- [ ] Probar `POST /agente` con Steven. Si no está, queda el respaldo por palabras clave.
- [ ] Versión móvil: sidebar como hoja completa, botón flotante a `bottom: 80px`, gráficas que caben en 390px.

**Congelamiento de funciones: 1:30 pm.** Después de esa hora no se agrega nada nuevo, solo se arregla.

### Fase 3 — Pulido y pitch (1:30 al cierre)

**Los dos**
- [ ] Recorrer el flujo completo 3 veces y anotar fallos en una lista compartida.
- [ ] Revisar textos contra `contenido.md` (lenguaje llano, sin errores de ortografía).
- [ ] Revisar tooltips en todas las cifras importantes (EBIT, ROIC, WACC, EVA, intercompañía, efectos).
- [ ] Probar en móvil (ancho 390) y en la pantalla del pitch.
- [ ] Grabar un video corto del flujo como respaldo por si falla la conexión.
- [ ] Preparar los datos de ejemplo para la demostración: el flujo debe funcionar sin internet.

**Reparto sugerido:** A prepara la demostración (guion paso a paso y respaldo con mock). B afina el agente, que es lo más llamativo del pitch.

## 4. Si el tiempo se acaba (recortar en este orden)

1. Pulido responsive del teléfono (dejar solo escritorio).
2. Enlace "Ver qué le pidió el agente al motor".
3. Texto libre del agente (dejar solo las 3 preguntas sugeridas).
4. Aceptar diferencia con confirmación (dejarlo como botón directo).
5. Tooltips de términos secundarios (dejar EBIT, ROIC, EVA y WACC).

**No se recorta nunca:** carga de archivos, lista de errores con "Corregir", compuerta, resultado antes/después, y al menos una gráfica del agente.

## 5. Definición de "terminado" para cada pieza

- Se ve igual que el prototipo.
- Funciona con el mock y con el backend (o cae al mock sin romperse).
- Se puede usar con teclado.
- Los textos coinciden con `contenido.md`.
- Está subida a `main`.

## 6. Mensajes cortos para coordinarse

- "Main listo, haz pull." (A → B, al terminar Fase 0)
- "Necesito un cambio en types.ts: …" (B → A)
- "Subí a main: …" (cada vez que se une algo)
- "Bloqueado en: …" (cualquiera, sin esperar más de 5 minutos)
