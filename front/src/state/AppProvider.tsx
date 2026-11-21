import { useMemo, useReducer, type ReactNode } from 'react';
import { CONSOLIDADO, CONSOLIDADO_BLOQUEADO, ERRORES } from '../shared/mock';
import { inicial, reducer } from './reducer';
import { AppContext, type App } from './useApp';

// ponytail: lee el mock; en Fase 2 errores y consolidado vienen de api/ con caída al mock.
export function AppProvider({ children }: { children: ReactNode }) {
  const [s, d] = useReducer(reducer, inicial);

  const app = useMemo<App>(() => {
    const pendientesBloq = ERRORES.filter((e) => e.severidad === 'bloqueante' && !s.resueltos.includes(e.id)).length;
    const publicable = s.cargado && pendientesBloq === 0;
    return {
      ...s,
      errores: ERRORES,
      pendientesBloq,
      publicable,
      consolidado: publicable ? CONSOLIDADO : CONSOLIDADO_BLOQUEADO,
      cargar: () => d({ tipo: 'cargar' }),
      ir: (paso) => d({ tipo: 'ir', paso }),
      corregir: (ids) => d({ tipo: 'resolver', ids, nota: 'Corregido' }),
      aceptarDiferencia: (id) => d({ tipo: 'resolver', ids: [id], nota: 'Diferencia aceptada' }),
      cambiarVersion: (version) => d({ tipo: 'version', version }),
      abrirAgente: () => d({ tipo: 'agente', abierto: true }),
      cerrarAgente: () => d({ tipo: 'agente', abierto: false }),
      reiniciar: () => d({ tipo: 'reiniciar' }),
    };
  }, [s]);

  return <AppContext.Provider value={app}>{children}</AppContext.Provider>;
}
