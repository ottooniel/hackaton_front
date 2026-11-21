// Valores esperados del backend v3 (docs/contenido.md). No inventar otros.
import type {
  BarraDivergente, BarraRef, ConsolidadoGrupo, ErrorValidacion, Puente, RespuestaAgente,
} from './types';

export const ERRORES: ErrorValidacion[] = [
  {
    id: 'A-01', empresa: 'AGRO', severidad: 'advertencia', esIntercompania: false,
    titulo: 'El total de una hoja no coincide con la suma',
    quePaso: 'La fila de total dice un número distinto al de sumar las filas que la forman.',
    comoSeCorrige: 'Recalcular el total a partir de las filas.',
    efecto: 'No bloquea. Se publica con un aviso.',
  },
  {
    id: 'A-02', empresa: 'AGRO', severidad: 'bloqueante', esIntercompania: false,
    titulo: 'Una fila viene en córdobas y AGRO reporta en lempiras',
    quePaso: 'AGRO reporta en lempiras (HNL), pero una fila viene en córdobas (NIO).',
    comoSeCorrige: 'Expresar esa fila en la moneda de la empresa antes de pasar a quetzales.',
    efecto: 'Bloquea el total del grupo.',
  },
  {
    id: 'A-03', empresa: 'CONC', severidad: 'bloqueante', esIntercompania: false,
    titulo: 'Un monto tiene el signo al revés',
    quePaso: 'Un monto que debería restar aparece sumando.',
    comoSeCorrige: 'Invertir el signo de esa fila.',
    efecto: 'En Presupuesto 2026 suma 6.72 M al EBIT del grupo.',
  },
  {
    id: 'A-04', empresa: 'CONC', severidad: 'bloqueante', esIntercompania: false,
    titulo: 'Una fila viene en dólares y CONC reporta en quetzales',
    quePaso: 'CONC reporta en quetzales (GTQ), pero una fila trae dólares (USD) sin convertir.',
    comoSeCorrige: 'Convertir esa fila de USD a GTQ con la tasa de supuestos.',
    efecto: 'En Presupuesto 2026 resta 16.49 M al EBIT del grupo.',
  },
  {
    id: 'A-05', empresa: 'HERR', severidad: 'bloqueante', esIntercompania: false,
    titulo: 'La misma fila aparece dos veces',
    quePaso: 'Hay una fila repetida, con los mismos datos.',
    comoSeCorrige: 'Quitar la repetida y dejar una sola.',
    efecto: 'Se contaría dos veces el mismo monto.',
  },
  {
    id: 'A-06', empresa: 'LOGI y AGRO', severidad: 'bloqueante', esIntercompania: true,
    titulo: 'LOGI y AGRO no coinciden en lo que se vendieron entre ellas',
    quePaso: 'LOGI registra una venta a AGRO por un monto distinto al que AGRO registra como compra.',
    comoSeCorrige: 'Una persona decide si la diferencia es aceptable o pide corregir los archivos.',
    efecto: 'Suma a la diferencia no conciliada del grupo (195,000 GTQ en total).',
  },
  {
    id: 'A-07', empresa: 'HERR y TRAC', severidad: 'bloqueante', esIntercompania: true,
    titulo: 'HERR y TRAC no coinciden en lo que se vendieron entre ellas',
    quePaso: 'HERR registra una venta a TRAC por un monto distinto al que TRAC registra como compra.',
    comoSeCorrige: 'Una persona decide si la diferencia es aceptable o pide corregir los archivos.',
    efecto: 'Suma a la diferencia no conciliada del grupo (195,000 GTQ en total).',
  },
];

/** Real 2025, ya corregido. */
export const CONSOLIDADO: ConsolidadoGrupo = {
  version: 'real_2025',
  publicable: true,
  ebitGrupo: 14_350_000,
  ebitSinCorregir: -386_105,
  roicGrupo: 0.0963,
  evaGrupo: -1_645_012,
  wacc: 0.11,
  sumaEmpresas: 14_545_000,
  diferenciaIC: 195_000,
  empresas: [
    { codigo: 'HERR', monedaLocal: 'MXN', ebit: 2_260_000, roic: 0.1560, eva: 497_391 },
    { codigo: 'FERR', monedaLocal: 'GTQ', ebit: 4_410_000, roic: 0.1497, eva: 909_925 },
    { codigo: 'AGRO', monedaLocal: 'HNL', ebit: 1_465_000, roic: 0.0820, eva: -412_735 },
    { codigo: 'TRAC', monedaLocal: 'USD', ebit: 2_390_000, roic: 0.0811, eva: -701_073 },
    { codigo: 'LOGI', monedaLocal: 'CRC', ebit: 1_570_000, roic: 0.0801, eva: -477_895 },
    { codigo: 'CONC', monedaLocal: 'GTQ', ebit: 2_450_000, roic: 0.0691, eva: -1_265_625 },
  ],
};

/** Mismo consolidado con la compuerta cerrada: el backend manda el grupo en null. */
export const CONSOLIDADO_BLOQUEADO: ConsolidadoGrupo = {
  ...CONSOLIDADO,
  publicable: false,
  ebitGrupo: null,
  roicGrupo: null,
  evaGrupo: null,
  sumaEmpresas: null,
  diferenciaIC: null,
};

export const ELIMINACIONES_IC = { ventas: 8_500_000, costos: 8_305_000 };

/** ROIC por empresa para GraficaBarrasRef (referencia 0.11, max 0.20). */
export const BARRAS_ROIC: BarraRef[] = CONSOLIDADO.empresas.map((e) => ({ etiqueta: e.codigo, valor: e.roic }));

/** Puente de HERR, Real 2025 → Ppto 2026 (GTQ). GraficaCascada: min 2_200_000, span 250_000. */
export const PUENTE_HERR: Puente = {
  empresa: 'HERR',
  pasos: [
    { etiqueta: 'EBIT Real 2025', valor: 2_260_000, tipo: 'total' },
    { etiqueta: 'Efecto operativo', valor: 110_825.53, tipo: 'efecto' },
    { etiqueta: 'Efecto cambiario', valor: 51_539.69, tipo: 'efecto' },
    { etiqueta: 'EBIT Ppto 2026', valor: 2_422_365.22, tipo: 'total' },
  ],
};

/** Costo del error en Ppto 2026, millones GTQ. GraficaDivergente: max 16.49. */
export const IMPACTO_ERRORES: BarraDivergente[] = [
  { etiqueta: 'Error de signo', valor: 6.72 },
  { etiqueta: 'Error de moneda', valor: -16.49 },
  { etiqueta: 'Neto que se ve en el total', valor: -9.77 },
];

export const RESPUESTAS_AGENTE: RespuestaAgente[] = [
  {
    pregunta: '¿Qué empresas rinden menos que su costo de capital?',
    texto: 'Cuatro de seis empresas rinden menos del 11% que cuesta su capital: AGRO, TRAC, LOGI y CONC. Solo HERR y FERR lo superan.',
    grafica: 'barras_ref',
    spec: { grafica: 'barras_con_referencia', datos: 'GET /consolidado?version=real_2025', referencia: 'wacc' },
  },
  {
    pregunta: '¿Por qué sube el EBIT de HERR?',
    texto: 'El EBIT de HERR sube 162,365 GTQ entre Real 2025 y Presupuesto 2026. De eso, 110,826 viene del negocio y 51,540 viene solo del tipo de cambio.',
    grafica: 'cascada',
    spec: { grafica: 'cascada', datos: 'GET /puente?empresa=HERR&desde=real_2025&hasta=ppto_2026' },
  },
  {
    pregunta: '¿Qué tan graves eran los errores?',
    texto: 'En Presupuesto 2026 el error de signo suma 6.72 millones y el de moneda resta 16.49. El total, −9.77 millones, parece moderado, pero esconde dos errores grandes que se compensan en parte.',
    grafica: 'divergente',
    spec: { grafica: 'barras_divergentes', datos: 'GET /impacto-errores?version=ppto_2026' },
  },
];

export const ARCHIVOS_ESPERADOS = ['Supuestos', 'TRAC', 'AGRO', 'FERR', 'CONC', 'HERR', 'LOGI'] as const;

/** Nombre exacto que exige el backend (viene en la hoja Empresas del 00_). Un archivo renombrado se ignora. */
export const NOMBRE_ARCHIVO: Record<(typeof ARCHIVOS_ESPERADOS)[number], string> = {
  Supuestos: '00_grupo_parametros_tasas_conciliaciones.xlsx',
  TRAC: '01_tractores_del_istmo_cierre2025.xlsx',
  AGRO: '02_agroinsumos_honduras_cierre2025.xlsx',
  FERR: '03_ferreteria_central_cierre2025.xlsx',
  CONC: '04_concretos_nacionales_cierre2025.xlsx',
  HERR: '05_herramientas_pro_mexico_cierre2025.xlsx',
  LOGI: '06_logistica_transporte_tico_cierre2025.xlsx',
};

export const AVISO_SIN_CIFRAS = 'Esta versión se calcula con el mismo motor. En este diseño inicial solo mostramos Real 2025.';
