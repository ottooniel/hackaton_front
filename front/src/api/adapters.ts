// Único lugar donde se convierte lo que manda el backend v3 (docs/API del motor…md).
// Montos: string con 2 decimales en GTQ ("14350000.00"). Fracciones: string de 4 decimales ("0.0963").
// Los componentes reciben números; ROIC/WACC como fracción (el % lo pone shared/formato.ts).
import type {
  BarraDivergente, ConsolidadoGrupo, EmpresaCodigo, ErrorValidacion, FilaEmpresa, Puente, VersionId,
} from '../shared/types';

export function num(v: string | number): number {
  const n = typeof v === 'number' ? v : Number(v.trim());
  if (!Number.isFinite(n)) throw new Error(`Número inválido del backend: ${String(v)}`);
  return n;
}

// ---------- Validación ----------

export interface AlertaCruda {
  id: string;
  regla: string;                       // 'total' | 'moneda' | 'signo' | 'duplicado' | 'intercompania' | …
  severidad: 'bloqueante' | 'advertencia';
  empresa: string | [string, string];  // par [vendedor, comprador] en intercompañía
  referencia?: string;                 // 'IC-2025-05' (solo intercompañía)
  filaIds: string[];
  mensaje: string;
  porQueImporta: string;
  comoSeCorrige: string;
}
export interface ValidacionCruda { version: VersionId; publicable: boolean; alertas: AlertaCruda[] }

// Títulos de una línea por regla (las 7 que tiene el validador). Moneda usa el mensaje del backend,
// que ya es corto y dice cuál: 'AGRO registró "Gasto financiero" en NIO, una moneda sin tasa.'
const TITULOS: Record<string, string> = {
  archivo_faltante: 'Falta el archivo de una empresa',
  encabezado: 'Una hoja no tiene los encabezados esperados',
  total: 'El total de una hoja no coincide con la suma',
  signo: 'Un monto tiene el signo al revés',
  duplicado: 'La misma fila aparece dos veces',
};

export function aErrores(v: ValidacionCruda): ErrorValidacion[] {
  return v.alertas.map((a) => {
    const ic = a.regla === 'intercompania' || Array.isArray(a.empresa);
    const empresa = Array.isArray(a.empresa) ? a.empresa.join(' y ') : a.empresa;
    return {
      id: a.id,
      empresa,
      severidad: a.severidad,
      esIntercompania: ic,
      referencia: a.referencia,
      titulo: ic ? `${empresa} no coinciden en lo que se vendieron entre ellas` : (TITULOS[a.regla] ?? a.mensaje),
      quePaso: a.mensaje,
      comoSeCorrige: a.comoSeCorrige,
      efecto: a.porQueImporta,
      filaId: a.filaIds[0],
    };
  });
}

// ---------- Consolidado / escenario ----------

interface ValorCrudo { valor: string; origen: string[] }
export interface IndicadoresCrudos {
  ventas: ValorCrudo; ebit: ValorCrudo; nopat: ValorCrudo; capital: ValorCrudo; capitalEmpleado: ValorCrudo;
  roic: string; roce: string; eva: ValorCrudo;
}
export interface ConsolidadoCrudo {
  version: VersionId;
  publicable: boolean;
  wacc?: string;
  ebitSinCorregir?: string;            // EBIT del grupo del dataset sin el escenario
  grupo: IndicadoresCrudos | null;
  empresas: Partial<Record<EmpresaCodigo, { moneda?: string; conAlertas: boolean; indicadores: IndicadoresCrudos }>>;
  eliminacionesIC: { ventasEliminadas: string; costosEliminados: string; diferenciaNoConciliada: string };
}

// Respaldo si el backend no manda moneda o wacc (versiones anteriores de la API).
const MONEDA: Record<EmpresaCodigo, string> = { TRAC: 'USD', AGRO: 'HNL', FERR: 'GTQ', CONC: 'GTQ', HERR: 'MXN', LOGI: 'CRC' };
const WACC = 0.11;

export function aConsolidado(c: ConsolidadoCrudo): ConsolidadoGrupo {
  const empresas: FilaEmpresa[] = Object.entries(c.empresas)
    .flatMap(([codigo, e]) => (e ? [{
      codigo: codigo as EmpresaCodigo,
      monedaLocal: e.moneda ?? MONEDA[codigo as EmpresaCodigo] ?? '',
      ebit: num(e.indicadores.ebit.valor),
      roic: num(e.indicadores.roic),
      eva: num(e.indicadores.eva.valor),
    }] : []))
    .sort((a, b) => b.roic - a.roic);

  const g = c.publicable ? c.grupo : null;   // compuerta
  return {
    version: c.version,
    publicable: g !== null,
    ebitGrupo: g ? num(g.ebit.valor) : null,
    ebitSinCorregir: c.ebitSinCorregir === undefined ? null : num(c.ebitSinCorregir),
    roicGrupo: g ? num(g.roic) : null,
    evaGrupo: g ? num(g.eva.valor) : null,
    wacc: c.wacc === undefined ? WACC : num(c.wacc),
    sumaEmpresas: g ? empresas.reduce((s, e) => s + e.ebit, 0) : null,
    diferenciaIC: g ? num(c.eliminacionesIC.diferenciaNoConciliada) : null,
    empresas,
  };
}

// ---------- Impacto de errores ----------

export type ImpactoItemCrudo =
  | { alertaId: string; regla: string; tipo: 'correccion'; valorConError: string; valorSinError: string; diferencia: string }
  | { alertaId: string; regla: string; tipo: 'intercompania'; referencia: string; diferenciaNoConciliada: string }
  | { alertaId: string; regla: string; tipo: 'sin_correccion' };
export interface ImpactoCrudo {
  version: VersionId;
  items: ImpactoItemCrudo[];
  total: { ebitConErrores: string; ebitCorregido: string };
}

const ETQ_ERROR: Record<string, string> = { signo: 'Error de signo', moneda: 'Error de moneda', duplicado: 'Fila duplicada' };

/**
 * Barras en millones GTQ + el neto que se ve en el total.
 * `diferencia` = EBIT con error − EBIT sin error: positivo = el error inflaba el EBIT.
 */
export function aImpacto(i: ImpactoCrudo): { barras: BarraDivergente[]; ebitSinCorregir: number } {
  const m = (v: string) => Math.round(num(v) / 1e4) / 100;
  const barras = i.items.flatMap((it) =>
    it.tipo === 'correccion' && num(it.diferencia) !== 0 ? [{ etiqueta: ETQ_ERROR[it.regla] ?? `Error ${it.alertaId}`, valor: m(it.diferencia) }] : []);
  const neto = Math.round(barras.reduce((s, b) => s + b.valor, 0) * 100) / 100;
  return {
    barras: [...barras, { etiqueta: 'Neto que se ve en el total', valor: neto }],
    ebitSinCorregir: num(i.total.ebitConErrores),
  };
}

// ---------- Puente ----------

export interface PuenteCrudo {
  empresa: EmpresaCodigo; metrica: 'ebit' | 'ventas'; moneda: string;
  desde: { version: VersionId }; hasta: { version: VersionId };
  base: string; operativo: string; cambiario: string; nuevo: string;
}

const VERSION: Record<VersionId, string> = { real_2025: 'Real 2025', ppto_2026: 'Ppto 2026', reforecast_2026: 'Reforecast 2026' };

export function aPuente(p: PuenteCrudo): Puente {
  const met = p.metrica === 'ebit' ? 'EBIT' : 'Ventas';
  return {
    empresa: p.empresa,
    pasos: [
      { etiqueta: `${met} ${VERSION[p.desde.version]}`, valor: num(p.base), tipo: 'total' },
      { etiqueta: 'Efecto operativo', valor: num(p.operativo), tipo: 'efecto' },
      { etiqueta: 'Efecto cambiario', valor: num(p.cambiario), tipo: 'efecto' },
      { etiqueta: `${met} ${VERSION[p.hasta.version]}`, valor: num(p.nuevo), tipo: 'total' },
    ],
  };
}
