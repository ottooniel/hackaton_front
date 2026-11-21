import { createContext, useContext } from 'react';
import type { ConsolidadoGrupo, VersionId } from '../shared/types';
import type { Estado, Paso } from './reducer';

export interface App extends Estado {
  pendientesBloq: number;     // bloqueantes sin resolver
  publicable: boolean;        // compuerta: true cuando no quedan bloqueantes
  consolidado: ConsolidadoGrupo;
  cargarEjemplo: () => void;
  subirArchivos: (archivos: File[]) => void;
  ir: (paso: Paso) => void;
  corregir: (ids: string[]) => void;
  corregirTodo: () => void;
  aceptarDiferencia: (id: string) => void;
  cambiarVersion: (v: VersionId) => void;
  abrirAgente: () => void;
  cerrarAgente: () => void;
  reiniciar: () => void;
}

export const AppContext = createContext<App | null>(null);

export function useApp(): App {
  const app = useContext(AppContext);
  if (!app) throw new Error('useApp debe usarse dentro de <AppProvider>');
  return app;
}
