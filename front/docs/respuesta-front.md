# Respuestas del back al front

Para: front (Otto y Carlos) · De: back (Steven) · 21 nov 2026

Gracias por el detalle. Ya está desplegado en `https://hackaton-back-7z3l.onrender.com/api` todo lo que pedían del back (secciones 3, 5 y 6), y el agente IA está en `https://hackaton-agente.onrender.com` (sección 1). Abajo va cada respuesta, en el mismo orden que su documento.

**Novedades en la API**

| Qué | Dónde | Detalle |
|---|---|---|
| Nuevo | `POST /reset` | Vuelve al dataset del reto. Responde `{ "ok": true, "totalRegistros": 213 }` |
| Nuevo campo | `/consolidado` y `/escenario` | `wacc` (fracción), `ebitSinCorregir` (monto) y `empresas[X].moneda` |
| Cambio | `POST /escenario` con `"todas"` | Aplica solo las correcciones de la versión pedida. Real 2025 → `["A-03", "A-05", "A-07"]` |
| Nuevo servicio | `https://hackaton-agente.onrender.com` | Agente IA: `/agente/preguntar` y `/api/explicar` |

---

## 1. Agente IA

El agente ya está desplegado en **`https://hackaton-agente.onrender.com`**, con CORS abierto y conectado al backend real de Render. El código vive en la rama `agente` (lo mantiene Elmer); cada push a esa rama lo redespliega.

| Método | Ruta | Body |
|---|---|---|
| POST | `/agente/preguntar` | `{ "pregunta": "..." }` |
| POST | `/api/explicar` | `{ "tipo": "alerta", "id": "A-05" }` o `{ "tipo": "puente", "empresa": "HERR" }` |
| GET | `/agente/informe` | — (informe largo; gasta mucha cuota) |

Ojo: las rutas del agente **no** llevan `/api` delante, salvo `/api/explicar`.

**Regla para el front:** usen `texto` solo si `fuente === "ia"`. Si viene `"plantilla"` (Groq falló o se acabó la cuota), muestren su propia frase: la plantilla del agente hoy puede traer un volcado de datos largo que no sirve para el sidebar.

**Prueba con las 3 preguntas del pitch** (21 nov, contra Render):

| Pregunta | Resultado | Tiempo |
|---|---|---|
| ¿Qué empresas rinden menos que su costo de capital? | IA, cifras correctas (CONC 6.91 %, TRAC 8.11 %, LOGI 8.01 %, AGRO 8.20 % vs WACC 11 %) | 4.2 s |
| ¿Por qué sube el EBIT de HERR? | IA, cifras correctas (2,260,000 → 2,422,365), pero todavía no separa efecto operativo y cambiario | 13.6 s |
| ¿Qué tan graves eran los errores en Ppto 2026? | Plantilla: se agotó la cuota por minuto de Groq | 12.5 s |

Con su límite de 8 s, hoy entraría la primera pregunta y las otras dos caerían a su plantilla. Para la "cascada" de HERR, la cifra buena es `GET /puente`; usen el agente solo para la frase.

Respuestas a sus preguntas:

1. **URL pública:** `https://hackaton-agente.onrender.com`. Plan free: se duerme sin tráfico igual que el back, y si los dos están dormidos la primera pregunta puede tardar más de un minuto. Antes del pitch, abran `/api/health` del back y hagan una pregunta de calentamiento al agente.
2. **Backend real:** sí, desplegado con `FUENTE=http` contra `https://hackaton-back-7z3l.onrender.com/api`. El impacto por alerta ya lo usa (herramienta `impactoPorAlerta`).
3. **Campo `grafica`:** todavía no existe. Lo pedimos a Elmer. Mientras tanto, sigan con su detección por palabras clave.
4. **8 s:** de acuerdo, con la regla de arriba. Las preguntas puntuales tardan entre 4 y 14 s; si se agota la cuota, el agente espera hasta 30 s y reintenta.
5. **Markdown:** libre (negritas, listas y a veces títulos). El modo `corto` no existe todavía; lo pedimos. Mientras tanto, tomen las primeras 1 a 3 frases.
6. **Cuota de Groq:** hay una sola llave de capa gratuita y ya está al límite (3 preguntas en un minuto la agotaron). Vamos a conseguir una llave aparte o el Dev Tier para el pitch. Hasta entonces, eviten probar el agente fuera de lo necesario.
7. **`/api/explicar`:** vive en el servicio del agente: `POST https://hackaton-agente.onrender.com/api/explicar`. En el back de Render sigue respondiendo 501; no lo usen ahí.
8. **Frase del pitch:** "La IA no calcula. Cada cifra sale del motor; el modelo solo la explica, y si no tiene el dato, lo dice." No digan que los datos no salen de la infraestructura: salen a Groq (con datos ficticios no hay problema).

## 2. `POST /upload`

Lo probamos con los Excel reales.

1. **Tipos:** `archivos` es la lista de nombres de archivo tal como se subieron. `faltantes` es la lista de **códigos de empresa**. Ejemplo real, con el archivo de LOGI renombrado:

   ```json
   {
     "archivos": ["00_grupo_parametros_tasas_conciliaciones.xlsx", "01_tractores_del_istmo_cierre2025.xlsx", "...", "LOGI_renombrado.xlsx"],
     "faltantes": ["LOGI"],
     "totalRegistros": 177,
     "alertas": { "bloqueantes": 15, "advertencias": 1 }
   }
   ```

2. **Errores:**

   | Caso | Status | `codigo` |
   |---|---|---|
   | Falta el `00_` | 400 | `SIN_PARAMETROS` |
   | Un archivo no se puede leer | 400 | `INGESTA` (ej.: `El libro no tiene la hoja "Empresas".`) |
   | Archivo > 10 MB, más de 10 archivos o campo que no se llama `archivos` | 500 | `ERROR_INTERNO` |

   Pueden mostrar `error.mensaje` tal cual. Los casos 500 deberían ser 400; ya se lo pasamos a Persona A.

3. **Cómo se reconoce cada archivo (importante):** el `00_` se reconoce por el prefijo. Cada empresa se reconoce por el **nombre exacto** de su archivo, el que viene en la hoja Empresas del `00_`. Si un archivo llega renombrado, se ignora y la empresa queda en `faltantes`, con una alerta bloqueante `archivo_faltante`. Los nombres reales **no contienen** `TRAC`, `AGRO`, etc., así que su detección de casillas no va a marcar nada. Comparen contra estos nombres:

   | Empresa | Archivo |
   |---|---|
   | — | `00_grupo_parametros_tasas_conciliaciones.xlsx` |
   | TRAC | `01_tractores_del_istmo_cierre2025.xlsx` |
   | AGRO | `02_agroinsumos_honduras_cierre2025.xlsx` |
   | FERR | `03_ferreteria_central_cierre2025.xlsx` |
   | CONC | `04_concretos_nacionales_cierre2025.xlsx` |
   | HERR | `05_herramientas_pro_mexico_cierre2025.xlsx` |
   | LOGI | `06_logistica_transporte_tico_cierre2025.xlsx` |

4. **Límites y formato:** hasta 10 archivos de 10 MB cada uno. Solo Excel: un `.csv` falla con `INGESTA` porque no tiene las hojas que se leen.

Además: cada `/upload` **reemplaza todo** el dataset, sin combinarlo con lo anterior. Siempre hay que subir el paquete completo (el `00_` y los 6). Las tasas editadas con `PUT /tasas` vuelven a las del `00_`. Si la ingesta falla, los datos anteriores quedan intactos.

## 3. Volver al dataset de ejemplo

Listo: `POST /reset`, sin body. Responde `{ "ok": true, "totalRegistros": 213 }`. Afecta a todos, igual que `/upload`. Después llamen a `/validacion`.

## 4. `/validacion`

1. **Todas las `regla`:** `archivo_faltante`, `encabezado`, `duplicado`, `signo`, `moneda`, `intercompania` y `total`. No hay más.
2. **`severidad`:** solo `bloqueante` y `advertencia`. Hoy solo `total` es advertencia.
3. **`titulo`:** les recomendamos armarlo en el front según la `regla`, porque son 7 valores fijos. El validador es de Persona A; si lo agrega, les avisamos.

## 5. `/escenario`

1. **A-01 en `aplicarCorrecciones`:** el 400 `SIN_CORRECCION` se queda. Mandar solo los bloqueantes es lo correcto. Las alertas intercompañía van en `aceptarIC` (con la referencia) y las advertencias no tienen corrección automática.
2. **A-04 en Real 2025:** no era intencional. Ya está corregido: `"todas"` aplica solo las alertas de la versión pedida.
3. **IDs:** correcto. Usen los IDs de la última `/validacion` del dataset actual. Después de un `/upload` o un `/reset`, vuelvan a pedir `/validacion`.

## 6. Campos nuevos en `/consolidado` y `/escenario`

Ya están los tres:

```json
{
  "version": "real_2025",
  "publicable": false,
  "wacc": "0.1100",
  "ebitSinCorregir": "-386104.70",
  "grupo": null,
  "empresas": { "HERR": { "moneda": "MXN", "conAlertas": true, "indicadores": { "...": "..." } } },
  "eliminacionesIC": { "...": "..." }
}
```

En `/escenario`, `ebitSinCorregir` es el EBIT del grupo del dataset actual **sin** el escenario. Sirve para mostrar el "antes" junto al resultado.

## 7. IDs y números del pitch

Confirmados. Los IDs de Real 2025 de su tabla son correctos. Los IDs son globales a las 3 versiones: A-04 existe, pero solo aplica a Ppto 2026.

| Ppto 2026 | Impacto en EBIT del grupo |
|---|---|
| A-04 signo (CONC, gastos de operación en negativo) | +6,720,000.00 |
| A-05 moneda (CONC, depreciación en USD) | −16,489,846.15 |
| Neto (5,771,120.05 con errores vs 15,540,966.20 corregido) | −9,769,846.15 |

Convención: `diferencia` = EBIT con error − EBIT sin error. Por eso el signo positivo de A-04 significa que el error **inflaba** el EBIT.

## 8. Otras versiones

Sí, las 3 versiones tienen el mismo flujo: alertas, compuerta, `/impacto-errores` y `/escenario`. En 2026 no hay alertas de intercompañía, así que basta `aplicarCorrecciones: "todas"`, sin `aceptarIC`:

| Versión | Correcciones con `"todas"` | EBIT del grupo publicado |
|---|---|---|
| Real 2025 | A-03, A-05, A-07 + `aceptarIC: ["IC-2025-03", "IC-2025-05"]` | 14,350,000.00 |
| Ppto 2026 | A-03, A-04, A-05, A-07 | 15,540,966.20 |
| Reforecast 2026 | A-03, A-05, A-07 | 14,603,102.21 |

## 9. Bitácora

Está bien en el front. No hace falta endpoint por ahora.

## 10. Pendientes

- `/sensibilidad` sigue en 501.
- **Agente:** un push a la rama `agente` lo redespliega. Antes del pitch aplica lo mismo que con el back: nada de push después de la última prueba.
- **Antes del pitch:** después de la última prueba no hacemos push a `main`. Para más seguridad, vamos a apagar **Auto-Deploy** en Render (Settings): así ningún push reinicia los datos por accidente.
- Si alguien sube archivos antes del pitch, `POST /reset` lo deja como estaba.
