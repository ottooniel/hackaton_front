import { useRef } from 'react';
import { useApp } from '../state/useApp';
import { AgenteFab } from './AgenteFab';
import { AgenteSidebar } from './AgenteSidebar';

export function Agente() {
  const { agenteAbierto, abrirAgente, cerrarAgente } = useApp();
  const fab = useRef<HTMLButtonElement>(null);
  const cerrar = () => { cerrarAgente(); fab.current?.focus(); };   // el foco vuelve al botón que lo abrió
  return (
    <>
      <AgenteFab ref={fab} onClick={abrirAgente} expandido={agenteAbierto} />
      {agenteAbierto && <AgenteSidebar onCerrar={cerrar} />}
    </>
  );
}
