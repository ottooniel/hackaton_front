# contenido.md — Textos, datos y contrato

Todo el texto está en español neutro, en lenguaje que entienda cualquier rol financiero. No usar "predicción": usar "simulación de escenarios". Los números nunca los toca la IA.

## 1. Contrato de datos (`src/shared/types.ts`)

Este archivo es el acuerdo entre las dos personas. **Solo lo edita la Persona A**, y cualquier cambio se avisa por chat antes de subirlo.

```ts
export type VersionId = 'real_2025' | 'ppto_2026' | 'reforecast_2026';
export type Severidad = 'bloqueante' | 'advertencia';
export type EmpresaCodigo = 'TRAC' | 'AGRO' | 'FERR' | 'CONC' | 'HERR' | 'LOGI';

export interface ErrorValidacion {
  id: string;               // 'A-01' … 'A-07'
  empresa: string;          // 'AGRO' o 'LOGI y AGRO'
  severidad: Severidad;
  esIntercompania: boolean; // true → acción "Aceptar diferencia"
  titulo: string;           // una línea, lenguaje llano
  quePaso: string;
  comoSeCorrige: string;
  efecto: string;
  filaId?: string;          // formato archivo:hoja:fila:versión
}

export interface FilaEmpresa {
  codigo: EmpresaCodigo;
  monedaLocal: string;      // 'MXN', 'USD', …
  ebit: number;             // GTQ
  roic: number;             // fracción: 0.156 = 15.6 %
  eva: number;              // GTQ
}

export interface ConsolidadoGrupo {
  version: VersionId;
  publicable: boolean;      // false → grupo no se muestra (compuerta)
  ebitGrupo: number | null;
  ebitSinCorregir: number | null;
  roicGrupo: number | null;
  evaGrupo: number | null;
  wacc: number;             // 0.11
  sumaEmpresas: number | null;
  diferenciaIC: number | null;
  empresas: FilaEmpresa[];
}

export interface PasoPuente { etiqueta: string; valor: number; tipo: 'total' | 'efecto' }
export interface Puente { empresa: EmpresaCodigo; pasos: PasoPuente[] } // 4 pasos

export interface BarraRef { etiqueta: string; valor: number }               // ROIC por empresa
export interface BarraDivergente { etiqueta: string; valor: number }        // millones GTQ

export type TipoGrafica = 'barras_ref' | 'cascada' | 'divergente';
export interface RespuestaAgente {
  pregunta: string;
  texto: string;            // frase corta en lenguaje llano
  grafica: TipoGrafica;
  spec: Record<string, unknown>; // lo que se muestra en "Ver qué le pidió el agente al motor"
}
```

Datos que cada gráfica recibe por props:

| Componente | Props |
|---|---|
| `GraficaBarrasRef` | `items: BarraRef[]`, `referencia: number` (0.11), `max: number` (0.20) |
| `GraficaCascada` | `pasos: PasoPuente[]`, `min: number`, `span: number` |
| `GraficaDivergente` | `items: BarraDivergente[]`, `max: number` |

## 2. Datos de ejemplo (`src/shared/mock.ts`)

Valores esperados del backend v3. **No inventar otros.**

**Real 2025, corregido**

| Empresa | Moneda | EBIT (GTQ) | ROIC | EVA (GTQ) |
|---|---|---|---|---|
| HERR | MXN | 2,260,000 | 15.60% | 497,391 |
| FERR | GTQ | 4,410,000 | 14.97% | 909,925 |
| AGRO | HNL | 1,465,000 | 8.20% | −412,735 |
| TRAC | USD | 2,390,000 | 8.11% | −701,073 |
| LOGI | CRC | 1,570,000 | 8.01% | −477,895 |
| CONC | GTQ | 2,450,000 | 6.91% | −1,265,625 |

Grupo: suma de empresas 14,545,000 − diferencia intercompañía no conciliada 195,000 = **EBIT 14,350,000**. Sin corregir: **−386,105**. Diferencia: 14,736,105. ROIC grupo **9.63%**, EVA grupo **−1,645,012**, WACC **11%**. Eliminaciones intercompañía: ventas 8,500,000 y costos 8,305,000.

**Puente de HERR, Real 2025 → Ppto 2026 (GTQ)**: base 2,260,000 + efecto operativo 110,825.53 + efecto cambiario 51,539.69 = 2,422,365.22.

**Costo del error en Ppto 2026 (millones GTQ)**: error de signo +6.72, error de moneda −16.49, neto −9.77.

Presupuesto 2026 y Reforecast 2026 no tienen cifras de grupo en el mock. Mostrar el aviso: "Esta versión se calcula con el mismo motor. En este diseño inicial solo mostramos Real 2025."

## 3. Textos de la interfaz

**Encabezado**
- Kicker: Consolidación presupuestaria
- Título: Tus números, consolidados y explicados
- Frase: Sube tus archivos. Revisamos los errores, te mostramos el resultado y respondemos tus preguntas con gráficas.

**Pasos**: 1 Carga ("Sube tus archivos" / "7 archivos listos") · 2 Revisa ("Errores y diferencias" / "N por resolver" / "Todo resuelto") · 3 Entiende ("Resultado y preguntas").

**Paso 1**: "Carga tus archivos" · "Un archivo de supuestos y uno por empresa. Solo archivos Excel (.xlsx)." · "Arrastra aquí tus archivos" · "o haz clic para elegirlos desde tu computadora" · "Esperamos:" · botón "Probar con datos de ejemplo" · nota "Sin archivos a la mano. Cargamos las seis empresas del reto."

**Paso 2**: "Revisa lo que encontramos" · "Hasta resolver lo marcado como bloqueante, no publicamos el total del grupo. Toca una fila para ver el detalle." · botón "Corregir todo lo corregible" · "N de 7 resueltos" · "Total del grupo bloqueado: faltan N" · "Listo para publicar" · botones "Corregir", "Aceptar diferencia", "Ver el resultado" · pie "Cada corrección queda anotada en la bitácora."

Etiquetas de estado de fila: Bloqueante · Advertencia · Corregido · Diferencia aceptada.

**Paso 3**: "Con los datos tal como llegaron" (−0.39 M, tachado) · "EBIT del grupo, corregido (GTQ)" (14.35 M) · "Los errores escondían 14.74 millones de utilidad. Ahora cada cifra se puede rastrear hasta su fila de origen." · tarjeta ROIC "9.63%" + "La línea es el costo del capital (11%). El grupo queda debajo." · tarjeta EVA "−1.65 M" + chip "Hay utilidad, pero no alcanza" · tarjeta "Cómo se llega al total" (suma de las 6 empresas, diferencia entre empresas del grupo, EBIT del grupo).

**Tarjeta del agente**: "¿Quieres entender algo más?" · "Pregúntale al agente. Te responde con una gráfica hecha para tu pregunta." · botón "Abrir el agente".

**Sidebar del agente**: título "Pregúntale a tus números" · subtítulo "Los valores salen del motor de cálculo" · "Preguntas sugeridas" · placeholder "Escribe tu pregunta" · botón "Preguntar" · "Armando la gráfica…" · enlace "Ver qué le pidió el agente al motor" · si está bloqueado: "Todavía bloqueado" / "Resuelve los errores bloqueantes para poder preguntar." / "El agente solo trabaja con cifras publicables." / botón "Ir a revisar".

**Pie**: "Cifras de ejemplo del reto. Ninguna IA modifica los números." · "Reiniciar la demostración".

## 4. Los 7 errores (lenguaje llano)

| ID | Empresa | Severidad | Título | Qué pasó | Cómo se corrige | Efecto |
|---|---|---|---|---|---|---|
| A-01 | AGRO | Advertencia | El total de una hoja no coincide con la suma | La fila de total dice un número distinto al de sumar las filas que la forman. | Recalcular el total a partir de las filas. | No bloquea. Se publica con un aviso. |
| A-02 | AGRO | Bloqueante | Una fila viene en córdobas y AGRO reporta en lempiras | AGRO reporta en lempiras (HNL), pero una fila viene en córdobas (NIO). | Expresar esa fila en la moneda de la empresa antes de pasar a quetzales. | Bloquea el total del grupo. |
| A-03 | CONC | Bloqueante | Un monto tiene el signo al revés | Un monto que debería restar aparece sumando. | Invertir el signo de esa fila. | En Presupuesto 2026 suma 6.72 M al EBIT del grupo. |
| A-04 | CONC | Bloqueante | Una fila viene en dólares y CONC reporta en quetzales | CONC reporta en quetzales (GTQ), pero una fila trae dólares (USD) sin convertir. | Convertir esa fila de USD a GTQ con la tasa de supuestos. | En Presupuesto 2026 resta 16.49 M al EBIT del grupo. |
| A-05 | HERR | Bloqueante | La misma fila aparece dos veces | Hay una fila repetida, con los mismos datos. | Quitar la repetida y dejar una sola. | Se contaría dos veces el mismo monto. |
| A-06 | LOGI y AGRO | Bloqueante (IC) | LOGI y AGRO no coinciden en lo que se vendieron entre ellas | LOGI registra una venta a AGRO por un monto distinto al que AGRO registra como compra. | Una persona decide si la diferencia es aceptable o pide corregir los archivos. | Suma a la diferencia no conciliada del grupo (195,000 GTQ en total). |
| A-07 | HERR y TRAC | Bloqueante (IC) | HERR y TRAC no coinciden en lo que se vendieron entre ellas | HERR registra una venta a TRAC por un monto distinto al que TRAC registra como compra. | Una persona decide si la diferencia es aceptable o pide corregir los archivos. | Suma a la diferencia no conciliada del grupo (195,000 GTQ en total). |

Pendiente de confirmar con Steven: que A-03 sea el +6.72 M y A-04 el −16.49 M.

Reglas: A-01 a A-05 se corrigen con "Corregir". A-06 y A-07 solo con "Aceptar diferencia" (decisión humana, el sistema no las acepta solo). "Corregir todo" aplica A-01 a A-05.

## 5. Glosario (tooltips) — `src/shared/glosario.ts`

Un solo objeto `glosario` usado por `<Termino clave="…">`. Texto corto, sin siglas sin explicar.

| Clave | Texto del tooltip |
|---|---|
| `ebit` | Utilidad operativa: lo que gana el negocio con su operación, antes de intereses e impuestos. |
| `roic` | Retorno sobre el capital invertido: cuánta utilidad genera cada quetzal puesto en el negocio, después de impuestos. |
| `wacc` | Costo del capital: el rendimiento mínimo que debería dar el dinero invertido. Aquí es 11%. |
| `eva` | Valor económico agregado: lo que queda después de pagar el costo del capital. Negativo significa que rinde menos de lo que cuesta financiarse. |
| `intercompania` | Ventas y compras entre empresas del mismo grupo. Al consolidar se eliminan para no contar dos veces lo mismo. |
| `tasa` | Cuántas unidades de moneda local equivalen a 1 quetzal. Se usa para llevar todo a GTQ. |
| `efecto_operativo` | Cambio por el negocio en sí (ventas y costos), medido con la misma tasa de cambio. |
| `efecto_cambiario` | Cambio que viene solo del movimiento de la tasa de cambio, aunque el negocio no haya cambiado. |
| `compuerta` | Regla que impide publicar el total del grupo mientras haya errores que lo vuelvan engañoso. |

## 6. Agente: preguntas, respuestas y especificación

Tres preguntas sugeridas (cada una dispara una gráfica distinta):

| Pregunta | Gráfica | Respuesta |
|---|---|---|
| ¿Qué empresas rinden menos que su costo de capital? | `barras_ref` | Cuatro de seis empresas rinden menos del 11% que cuesta su capital: AGRO, TRAC, LOGI y CONC. Solo HERR y FERR lo superan. |
| ¿Por qué sube el EBIT de HERR? | `cascada` | El EBIT de HERR sube 162,365 GTQ entre Real 2025 y Presupuesto 2026. De eso, 110,826 viene del negocio y 51,540 viene solo del tipo de cambio. |
| ¿Qué tan graves eran los errores? | `divergente` | En Presupuesto 2026 el error de signo suma 6.72 millones y el de moneda resta 16.49. El total, −9.77 millones, parece moderado, pero esconde dos errores grandes que se compensan en parte. |

Especificación que muestra "Ver qué le pidió el agente al motor":

```json
{ "grafica": "barras_con_referencia", "datos": "GET /consolidado?version=real_2025", "referencia": "wacc" }
{ "grafica": "cascada", "datos": "GET /puente?empresa=HERR&desde=real_2025&hasta=ppto_2026" }
{ "grafica": "barras_divergentes", "datos": "GET /impacto-errores?version=ppto_2026" }
```

**Cómo funciona de verdad (decisión):** el agente (Ollama) solo elige el tipo de gráfica, de una lista cerrada de 3, y redacta la frase. Los números los entrega el motor. En el front:

1. Intento principal: `POST /agente { pregunta }` → `RespuestaAgente`. **Endpoint por acordar con Steven**, no existe en el backend v3.
2. Respaldo (ya funciona sin backend): función `detectarGrafica(texto)` por palabras clave.
   - `herr|puente|sube|cambio|tasa|peso` → cascada
   - `error|grave|signo|moneda|duplic` → divergente
   - cualquier otra cosa → barras con referencia
3. Si el endpoint falla o tarda más de 3 s, usar el respaldo sin mostrar error.

## 7. Qué endpoint alimenta cada pantalla

| Pantalla | Endpoint (backend v3) |
|---|---|
| Carga | `POST /upload` |
| Revisión | `GET /validacion`, `GET /impacto-errores` |
| Corregir / Aceptar | `POST /escenario` con `aplicarCorrecciones` (`"todas"` o lista de ids) y `aceptarIC` |
| Resultado | `GET /consolidado` (si `publicable:false`, `grupo:null`) |
| Puente del agente | `GET /puente` |
| Texto "Explícame esto" | `POST /explicar` (con plantilla de respaldo en el backend) |

Los montos llegan como **cadenas decimales** y los porcentajes como **fracciones**. Convertir en un solo lugar: `src/api/adapters.ts` (Persona A). Los componentes reciben números ya convertidos.

Formato: miles con coma (`14,350,000`), negativos con signo menos (`−`), millones con dos decimales y la letra M (`14.35 M`), porcentajes con dos decimales (`9.63%`).