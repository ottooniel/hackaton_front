import { useEffect, useMemo, useReducer, type ReactNode } from 'react';
import * as api from '../api/client';
import { ARCHIVOS_ESPERADOS, CONSOLIDADO, CONSOLIDADO_BLOQUEADO, ERRORES } from '../shared/mock';
import { esPublicable, inicial, pendientesBloq, reducer, type Estado } from './reducer';
import { AppContext, type App } from './useApp';

/** Casillas que reconocemos por el nombre del archivo ("05_herramientas…HERR.xlsx" → HERR; "00_…" → Supuestos). */
const casillas = (archivos: File[]) =>
  ARCHIVOS_ESPERADOS.filter((n) => archivos.some((f) => {
    const nombre = f.name.toUpperCase();
    return n === 'Supuestos' ? nombre.startsWith('00_') || nombre.includes('SUPUESTO') : nombre.includes(n);
  }));

/** Lo que se manda a POST /escenario: bloqueantes corregidas (ids) y diferencias aceptadas (referencias IC). */
function pedidoEscenario(s: Estado) {
  const hechos = s.errores.filter((e) => s.resueltos.includes(e.id));
  return {
    // Las advertencias no tienen corrección automática en el motor (A-01 da 400 SIN_CORRECCION).
    corregidos: hechos.filter((e) => !e.esIntercompania && e.severidad === 'bloqueante').map((e) => e.id),
    aceptados: hechos.flatMap((e) => (e.esIntercompania && e.referencia ? [e.referencia] : [])),
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [s, d] = useReducer(reducer, inicial);

  useEffect(() => { if (!api.USAR_MOCK) api.despertar(); }, []);

  // Con backend: cada cambio de resoluciones o versión pide el escenario. Si falla, se queda el mock.
  useEffect(() => {
    if (s.fuente !== 'api' || !s.cargado) return;
    const { corregidos, aceptados } = pedidoEscenario(s);
    let vigente = true;
    api.escenario(s.version, corregidos, aceptados, s.ebitSinCorregir)
      .then((c) => vigente && d({ tipo: 'consolidado', c }))
      .catch(() => undefined);
    return () => { vigente = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo estos campos cambian el pedido
  }, [s.fuente, s.cargado, s.errores, s.resueltos, s.version, s.ebitSinCorregir]);

  const app = useMemo<App>(() => {
    const publicable = esPublicable(s);
    const corregibles = s.errores.filter((e) => !e.esIntercompania).map((e) => e.id);
    const mock = () => d({ tipo: 'cargar', archivos: [...ARCHIVOS_ESPERADOS], errores: ERRORES, fuente: 'mock' });

    /** Trae alertas y costo del error del dataset que tenga el servidor. */
    const desdeApi = (archivos: string[]) =>
      Promise.all([api.validacion(s.version), api.impactoErrores(s.version)])
        .then(([errores, impacto]) => d({ tipo: 'cargar', archivos, errores, fuente: 'api', ebitSinCorregir: impacto.ebitSinCorregir }));

    // Mientras llega la respuesta del escenario se usa el mock con la misma compuerta, para no mostrar un grupo viejo.
    const deApi = s.consolidadoApi && s.consolidadoApi.publicable === publicable ? s.consolidadoApi : null;

    return {
      ...s,
      pendientesBloq: pendientesBloq(s),
      publicable,
      consolidado: deApi ?? (publicable ? CONSOLIDADO : CONSOLIDADO_BLOQUEADO),
      cargarEjemplo: () => {
        if (api.USAR_MOCK) return mock();
        // ponytail: "ejemplo" = el dataset que tenga el servidor (vuelve al del reto cuando Render reinicia).
        d({ tipo: 'subiendo' });
        desdeApi([...ARCHIVOS_ESPERADOS]).catch(mock);   // sin conexión: mock, sin mostrar error
      },
      subirArchivos: (archivos) => {
        if (api.USAR_MOCK) {
          d({ tipo: 'cargar', archivos: casillas(archivos), errores: ERRORES, fuente: 'mock' });
          return;
        }
        d({ tipo: 'subiendo' });
        api.subir(archivos)
          .then(() => desdeApi(casillas(archivos)))
          .catch(() => d({ tipo: 'avisoRed' }));
      },
      ir: (paso) => d({ tipo: 'ir', paso }),
      corregir: (ids) => d({ tipo: 'resolver', ids, nota: 'Corregido' }),
      corregirTodo: () => d({ tipo: 'resolver', ids: corregibles, nota: 'Corregido' }),
      aceptarDiferencia: (id) => d({ tipo: 'resolver', ids: [id], nota: 'Diferencia aceptada' }),
      cambiarVersion: (version) => d({ tipo: 'version', version }),
      abrirAgente: () => d({ tipo: 'agente', abierto: true }),
      cerrarAgente: () => d({ tipo: 'agente', abierto: false }),
      reiniciar: () => d({ tipo: 'reiniciar' }),
    };
  }, [s]);

  return <AppContext.Provider value={app}>{children}</AppContext.Provider>;
}
