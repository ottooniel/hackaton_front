import type { ConsolidadoGrupo, ErrorValidacion, VersionId } from '../shared/types';

export type Paso = 1 | 2 | 3;
export type Fuente = 'mock' | 'api';

export interface Estado {
  paso: Paso;
  cargado: boolean;
  archivos: string[];        // casillas recibidas: 'Supuestos', 'TRAC', …
  errores: ErrorValidacion[];
  resueltos: string[];       // ids de errores corregidos o aceptados
  fuente: Fuente;
  consolidadoApi: ConsolidadoGrupo | null; // último consolidado del backend; null → mock
  subiendo: boolean;
  aviso: string | null;      // carga rechazada o backend caído → aviso + "Usar datos de ejemplo"
  version: VersionId;
  agenteAbierto: boolean;
  bitacora: string[];        // ponytail: en memoria, se pierde al recargar (así lo pide diseno.md §7)
}

export type Accion =
  | { tipo: 'subiendo' }
  | { tipo: 'cargar'; archivos: string[]; errores: ErrorValidacion[]; fuente: Fuente }
  | { tipo: 'aviso'; mensaje: string }
  | { tipo: 'ir'; paso: Paso }
  | { tipo: 'resolver'; ids: string[]; nota: string }
  | { tipo: 'consolidado'; c: ConsolidadoGrupo }
  | { tipo: 'version'; version: VersionId }
  | { tipo: 'agente'; abierto: boolean }
  | { tipo: 'reiniciar' };

export const inicial: Estado = {
  paso: 1,
  cargado: false,
  archivos: [],
  errores: [],
  resueltos: [],
  fuente: 'mock',
  consolidadoApi: null,
  subiendo: false,
  aviso: null,
  version: 'real_2025',
  agenteAbierto: false,
  bitacora: [],
};

const hora = () => new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
const anotar = (s: Estado, txt: string) => [...s.bitacora, `${hora()} · ${txt}`];

/** Bloqueantes sin resolver. La compuerta abre cuando llega a 0. */
export const pendientesBloq = (s: Estado) =>
  s.errores.filter((e) => e.severidad === 'bloqueante' && !s.resueltos.includes(e.id)).length;

export const esPublicable = (s: Estado) => s.cargado && pendientesBloq(s) === 0;

export function reducer(s: Estado, a: Accion): Estado {
  switch (a.tipo) {
    case 'subiendo':
      return { ...s, subiendo: true, aviso: null };
    case 'cargar':
      return {
        ...inicial, cargado: true, paso: 2, archivos: a.archivos, errores: a.errores, fuente: a.fuente,
        bitacora: anotar(s, a.fuente === 'mock' ? 'Datos de ejemplo cargados' : `Archivos subidos: ${a.archivos.length}`),
      };
    case 'aviso':
      return { ...s, subiendo: false, aviso: a.mensaje };
    case 'ir': {
      const s2 = { ...s, agenteAbierto: false };
      if (a.paso === 2 && !s.cargado) return s2;
      if (a.paso === 3 && !esPublicable(s)) return s2;   // compuerta
      return { ...s2, paso: a.paso };
    }
    case 'resolver': {
      const nuevos = a.ids.filter((id) => !s.resueltos.includes(id) && s.errores.some((e) => e.id === id));
      if (!nuevos.length) return s;
      return { ...s, resueltos: [...s.resueltos, ...nuevos], bitacora: anotar(s, `${a.nota}: ${nuevos.join(', ')}`) };
    }
    case 'consolidado':
      return { ...s, consolidadoApi: a.c };
    case 'version':
      return { ...s, version: a.version, consolidadoApi: null, bitacora: anotar(s, `Versión: ${a.version}`) };
    case 'agente':
      return { ...s, agenteAbierto: a.abierto };
    case 'reiniciar':
      return inicial;
  }
}
