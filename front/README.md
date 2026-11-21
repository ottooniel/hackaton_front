# Consolidación que se explica sola — front

Hackathon Open2 Build & Pitch (UVG) · Equipo 404 > 200 · Track 4, consolidación presupuestaria multiempresa.

Una sola vista en tres pasos para cualquier rol financiero:

1. **Carga**: subir el archivo de supuestos (`00_…`) y los 6 Excel de empresa, o probar con los datos del reto.
2. **Revisa**: los errores que encontró el motor, con corrección guiada y filas de origen. El total del grupo no se publica mientras haya bloqueantes.
3. **Entiende**: el resultado antes y después de corregir, y un agente que responde con gráficas.

Los números los calcula el backend. La IA solo redacta y nunca toca una cifra.

## Correr en local

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # compila y revisa tipos
npm run lint
```

Chequeos rápidos (sin dependencias):

```bash
node src/api/adapters.check.ts    # adapters contra respuestas reales del backend
node src/state/reducer.check.ts   # compuerta y reglas de estado
node src/agente/frases.check.ts   # recorte del texto del agente
```

## Configuración

Funciona sin `.env`. Para cambiar algo, copia `.env.example` a `.env.local`:

| Variable | Por defecto | Qué hace |
|---|---|---|
| `VITE_API_URL` | `https://hackaton-back-7z3l.onrender.com/api` | Motor de consolidación |
| `VITE_AGENTE_URL` | `https://hackaton-agente.onrender.com` | Agente IA. Vacío = solo respaldo por palabras clave |
| `VITE_USAR_MOCK` | `false` | `true` = sin backend, todo con datos de ejemplo |

Si el backend o el agente fallan, el front sigue con los datos de ejemplo sin mostrar errores técnicos.

## Desplegar en Vercel

- Framework: **Vite**. Root directory: `front`. Build: `npm run build`. Output: `dist`.
- No hace falta definir variables: los valores por defecto apuntan a los servicios desplegados.

## Antes del demo

- Abrir `https://hackaton-back-7z3l.onrender.com/api/health` y hacer una pregunta al agente: Render free tarda ~30 s (o más) en despertar.
- "Probar con datos de ejemplo" llama a `POST /reset`: vuelve al dataset del reto **para todos**.
- La cuota de Groq del agente es mínima: no probarlo fuera del ensayo.

## Estructura

```
src/
  shell/      header, stepper (barra inferior en móvil), pie
  carga/      paso 1
  revision/   paso 2, bitácora y filas de origen
  resultado/  paso 3
  agente/     botón flotante, sidebar, conexión al agente
  graficas/   barras con referencia, cascada, divergente
  ui/         Boton, Chip, Termino (tooltips), Tarjeta, iconos
  state/      useApp(), reducer, AppProvider
  api/        cliente del backend y adapters (único lugar que convierte datos)
  shared/     tipos, datos de ejemplo, glosario, formato de cifras
  styles/     tokens y base
```

Documentación de diseño, textos y contrato en `docs/`.
