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
