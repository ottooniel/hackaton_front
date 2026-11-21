import type { VersionId } from '../shared/types';

export type Paso = 1 | 2 | 3;

export interface Estado {
  paso: Paso;
  cargado: boolean;
  resueltos: string[];      // ids de errores corregidos o aceptados
  version: VersionId;
  agenteAbierto: boolean;
  bitacora: string[];       // ponytail: en memoria, se pierde al recargar (así lo pide diseno.md §7)
}

export type Accion =
  | { tipo: 'cargar' }
  | { tipo: 'ir'; paso: Paso }
  | { tipo: 'resolver'; ids: string[]; nota: string }
  | { tipo: 'version'; version: VersionId }
  | { tipo: 'agente'; abierto: boolean }
  | { tipo: 'reiniciar' };

export const inicial: Estado = {
  paso: 1,
  cargado: false,
  resueltos: [],
  version: 'real_2025',
  agenteAbierto: false,
  bitacora: [],
};

const hora = () => new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });

export function reducer(s: Estado, a: Accion): Estado {
  switch (a.tipo) {
    case 'cargar':
      return { ...s, cargado: true, paso: 2 };
    case 'ir':
      return { ...s, paso: a.paso, agenteAbierto: false };
    case 'resolver': {
      const nuevos = a.ids.filter((id) => !s.resueltos.includes(id));
      if (!nuevos.length) return s;
      return {
        ...s,
        resueltos: [...s.resueltos, ...nuevos],
        bitacora: [...s.bitacora, `${hora()} · ${a.nota}: ${nuevos.join(', ')}`],
      };
    }
    case 'version':
      return { ...s, version: a.version, bitacora: [...s.bitacora, `${hora()} · Versión: ${a.version}`] };
    case 'agente':
      return { ...s, agenteAbierto: a.abierto };
    case 'reiniciar':
      return inicial;
  }
}
