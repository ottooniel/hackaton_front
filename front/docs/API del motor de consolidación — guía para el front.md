# API del motor de consolidación — guía para el front

Nov 21, 2026 · @Steven

El backend está desplegado en `https://hackaton-back-7z3l.onrender.com/api` y responde los 12 endpoints del demo; solo faltan `/sensibilidad` y `/explicar`.

## Convenciones

- **URL base:** `https://hackaton-back-7z3l.onrender.com/api`. CORS abierto (`*`), JSON en todo.
- **Montos:** string con 2 decimales, en GTQ: `"14350000.00"`. El formato (Q, comas) lo pone el front.
- **Fracciones:** ROIC, ROCE, WACC y tasas como string de 4 decimales: `"0.0963"` = 9.63 %.
- **Versiones:** `real_2025` · `ppto_2026` · `reforecast_2026`. En los endpoints de cálculo `version` es opcional y vale `real_2025` por defecto; en `/validacion` es obligatoria.
- **Empresas:** `TRAC` · `AGRO` · `FERR` · `CONC` · `HERR` · `LOGI`.
- **Errores:** siempre `{ "error": { "codigo": "VERSION_INVALIDA", "mensaje": "..." } }` con 400 (entrada inválida), 409 (conflicto) o 500.
- **Trazabilidad:** todo valor trae `origen` con IDs de fila `archivo:hoja:fila:version`. Para mostrar las filas, páselos a `GET /registros?ids=`.

## Flujo del demo

Con los datos actuales ninguna versión es publicable hasta aplicar correcciones. El recorrido es:

1. `GET /validacion?version=real_2025` → lista de alertas, cada una con su fila y su explicación.
2. `GET /consolidado` → `publicable: false`, `grupo: null`, empresas marcadas con `conAlertas`.
3. `GET /impacto-errores` → cuánto mueve cada error el EBIT del grupo (A-05: −14,736,104.70).
4. `POST /escenario` con `aplicarCorrecciones: "todas"` y `aceptarIC: ["IC-2025-03", "IC-2025-05"]` → `publicable: true`, EBIT del grupo 14,350,000.00.
5. `GET /trazabilidad` y `GET /puente` para explicar de dónde sale cada número.

## Resumen de endpoints

| Método | Ruta | Parámetros | Devuelve | Estado |
| --- | --- | --- | --- | --- |
| GET | `/health` | — | `{ "ok": true }` | Listo |
| GET | `/consolidado` | `version` | Indicadores del grupo (con compuerta) y por empresa | Listo |
| GET | `/trazabilidad` | `metrica`, `nivel`, `version` | Árbol de una métrica hasta sus filas | Listo |
| GET | `/impacto-errores` | `version` | Costo de cada alerta en el EBIT del grupo + total | Listo |
| GET | `/puente` | `empresa`, `metrica`, `desde`, `hasta` | Base + operativo + cambiario = nuevo | Listo |
| POST | `/escenario` | body JSON | Consolidado recalculado, no se guarda | Listo |
| POST | `/upload` | multipart `archivos` | Resumen de ingesta; reemplaza el dataset | Listo |
| GET | `/empresas` | — | Código, nombre, país y moneda | Listo |
| GET | `/supuestos` | — | Parámetros y supuestos de cálculo | Listo |
| GET | `/tasas` | — | Tasas por moneda y tipo | Listo |
| PUT | `/tasas` | body JSON parcial | Tasas actualizadas; sí se guarda | Listo |
| GET | `/validacion` | `version` (obligatoria) | Alertas y si la versión es publicable | Listo |
| GET | `/registros` | `empresa`, `version`, `ids` (opcionales) | Registros normalizados | Listo |
| GET | `/sensibilidad` | — | Ranking de variables por impacto | 501, pendiente |
| POST | `/explicar` | — | Texto en lenguaje claro | 501, pendiente |

Valores válidos: `metrica` en trazabilidad = `ventas` · `ebit` · `nopat` · `capital` · `capitalEmpleado` · `eva`; en puente = `ebit` · `ventas`. `nivel` = `grupo` o un código de empresa.

## Consolidado y trazabilidad

### GET /consolidado?version=real\_2025

Siempre responde 200. Si hay alertas bloqueantes, `publicable: false` y `grupo: null`; las empresas sí vienen. `grupo` tiene la misma forma que `indicadores`.

```json
{
  "version": "real_2025",
  "publicable": false,
  "grupo": null,
  "empresas": {
    "FERR": {
      "conAlertas": false,
      "indicadores": {
        "ventas": { "valor": "53850000.00", "origen": ["03_ferreteria_central_cierre2025.xlsx:Presupuesto:5:real_2025", "..."] },
        "ebit": { "valor": "4410000.00", "origen": ["..."] },
        "nopat": { "valor": "3432500.00", "origen": ["..."] },
        "capital": { "valor": "...", "origen": ["..."] },
        "capitalEmpleado": { "valor": "...", "origen": ["..."] },
        "roic": "0.1497",
        "roce": "0.2212",
        "eva": { "valor": "909925.00", "origen": ["..."] }
      }
    }
  },
  "eliminacionesIC": { "ventasEliminadas": "8500000.00", "costosEliminados": "8305000.00", "diferenciaNoConciliada": "195000.00" }
}
```

### GET /trazabilidad?metrica=ebit&nivel=grupo&version=real\_2025

Los componentes son los tipos que forman la métrica; sumados con su `signo` dan `valor`. Con `nivel=grupo`, los `hijos` son empresas; con `nivel=FERR`, son filas (`nombre` = concepto). En EVA, el capital aparece como `cargo_capital` = WACC × capital, con signo `-`.

```json
{
  "metrica": "ebit", "nivel": "grupo", "version": "real_2025", "valor": "-386104.70",
  "componentes": [
    { "nombre": "venta_ext", "signo": "+", "valor": "175000000.00",
      "hijos": [ { "nombre": "FERR", "valor": "52000000.00", "origen": ["03_ferreteria_central_cierre2025.xlsx:Presupuesto:5:real_2025"] } ] },
    { "nombre": "costo_ext", "signo": "-", "valor": "...", "hijos": [] }
  ]
}
```

## Costo del error, puente y escenario

### GET /impacto-errores?version=real\_2025

Un item por alerta de la versión. Su `tipo` dice qué forma tiene:

- `correccion`: la alerta se corrige sola; trae EBIT del grupo con y sin el error, e indicadores afectados (ROIC, ROCE y EVA del grupo; EBIT y ROIC de la empresa).
- `intercompania`: no se corrige sola. Trae la diferencia no conciliada y lo que cada lado metió a su EBIT individual. El EBIT del grupo no cambia.
- `sin_correccion`: solo `alertaId` y `regla` (por ejemplo, un total que no cuadra).

```json
{
  "version": "real_2025",
  "items": [
    { "alertaId": "A-05", "regla": "moneda", "tipo": "correccion",
      "supuestoCorreccion": "Se asume que la moneda correcta es GTQ (moneda funcional de CONC).",
      "metrica": "ebit_grupo", "valorConError": "-386104.70", "valorSinError": "14350000.00", "diferencia": "-14736104.70",
      "indicadoresAfectados": [ { "nombre": "roic", "nivel": "grupo", "con": "-0.0269", "sin": "0.0963" } ] },
    { "alertaId": "A-02", "regla": "intercompania", "tipo": "intercompania", "referencia": "IC-2025-05",
      "diferenciaNoConciliada": "-115000.00",
      "efectoEbitIndividual": [ { "empresa": "LOGI", "monto": "1150000.00" }, { "empresa": "AGRO", "monto": "-1265000.00" } ] },
    { "alertaId": "A-01", "regla": "total", "tipo": "sin_correccion" }
  ],
  "total": { "ebitConErrores": "-386104.70", "ebitCorregido": "14350000.00" }
}
```

### GET /puente?empresa=HERR&metrica=ebit&desde=real\_2025&hasta=ppto\_2026

Separa el cambio en efecto operativo y cambiario: `base + operativo + cambiario = nuevo`, exacto. `local` está en la moneda de la empresa; `tasa` va en moneda local por 1 GTQ.

```json
{
  "empresa": "HERR", "metrica": "ebit", "moneda": "MXN",
  "desde": { "version": "real_2025", "local": "5311000.00", "tasa": "2.35" },
  "hasta": { "version": "ppto_2026", "local": "5571440.00", "tasa": "2.3" },
  "base": "2260000.00", "operativo": "110825.53", "cambiario": "51539.69", "nuevo": "2422365.22"
}
```

Si la empresa tiene filas de esa métrica en otra moneda (hoy CONC), responde **409** `MONEDA_MIXTA` con `error.filaIds` y `error.alerta`, la alerta que lo causa. Muéstrenla en vez del puente.

### POST /escenario

No guarda nada: recalcula y devuelve. Todos los campos son opcionales salvo que quieran otra versión.

```json
{
  "version": "real_2025",
  "aplicarCorrecciones": "todas",
  "aceptarIC": ["IC-2025-03", "IC-2025-05"],
  "tasas": { "MXN": { "promedio": "2.40" } }
}
```

- `aplicarCorrecciones`: `"todas"` o lista de IDs de alerta (`["A-04", "A-05"]`). Una alerta intercompañía pedida aquí da 400: va en `aceptarIC`.
- `aceptarIC`: **referencias** IC (`"IC-2025-05"`), no IDs de alerta, porque los IDs se renumeran al corregir.
- `tasas`: solo monedas que ya existen; tipos `cierre`, `promedio`, `presupuesto`.

La respuesta tiene la misma forma que `/consolidado`, más:

```json
"escenario": { "correccionesAplicadas": ["A-03", "A-04", "A-05", "A-07"], "icAceptadas": ["IC-2025-03", "IC-2025-05"], "tasasEditadas": ["MXN.promedio"] }
```

## Datos de entrada y validación

### GET /validacion?version=real\_2025

`version` es obligatoria aquí. Cada alerta trae `mensaje`, `porQueImporta` y `comoSeCorrige` listos para mostrar; `filaIds` lleva a las filas con `/registros?ids=`.

```json
{
  "version": "real_2025", "publicable": false,
  "resumen": { "bloqueantes": 5, "advertencias": 1 },
  "alertas": [
    { "id": "A-01", "regla": "total", "severidad": "advertencia", "empresa": "AGRO", "versiones": ["real_2025"],
      "filaIds": ["02_agroinsumos_honduras_cierre2025.xlsx:Balance_General:13"],
      "mensaje": "AGRO declara \"Total activo corriente\" por 48,931,238 y la suma de las líneas es 48,811,238.",
      "porQueImporta": "...", "comoSeCorrige": "..." }
  ]
}
```

`empresa` es un código o, en alertas intercompañía, un par `[vendedor, comprador]`; esas alertas traen también `referencia`.

### Los demás

- `GET /empresas` → `[{ "codigo": "TRAC", "nombre": "Tractores del Istmo, S.A.", "pais": "Guatemala", "moneda": "USD" }, ...]`
- `GET /tasas` → `{ "MXN": { "cierre": "2.3900", "promedio": "2.3500", "presupuesto": "2.3000" }, ... }`
- `PUT /tasas` con body parcial `{ "MXN": { "promedio": "2.40" } }` → tabla completa actualizada. **Sí cambia el dataset** para todos; para probar sin guardar usen `/escenario`.
- `GET /supuestos` → `{ "parametros": { "monedaGrupo": "GTQ", "wacc": "0.1100", "toleranciaIC": "100.00", ... }, "supuestos": [{ "nombre", "detalle" }] }`
- `GET /registros?empresa=HERR&version=real_2025` o `?ids=id1,id2` → `{ "registros": [{ "id", "empresa", "version", "concepto", "tipo", "moneda", "tasa", "monto", "montoGrupo", ... }] }`. `montoGrupo` es `null` si la moneda no tiene tasa.
- `POST /upload` multipart con campo `archivos` (los 7 Excel; el `00_` es obligatorio) → `{ "archivos", "faltantes", "totalRegistros", "alertas": { "bloqueantes", "advertencias" } }`. Reemplaza el dataset para todos.

## A tener en cuenta

- **Arranque en frío:** el plan free de Render se duerme tras \~15 min sin uso y la primera llamada tarda \~30 s. Muestren un loading y abran `/api/health` antes del demo.
- **Estado compartido y en memoria:** `/upload` y `PUT /tasas` cambian los datos para todos los que usan la API, y se pierden cuando Render reinicia; el servidor vuelve al dataset de ejemplo.
- **Pendientes:** `/sensibilidad` y `/explicar` responden 501 por ahora.
- **Despliegue:** cada push a `main` redespliega solo en unos 2–3 minutos.
