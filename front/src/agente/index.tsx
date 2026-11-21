import { useEffect, useRef } from 'react';
import { useApp } from '../state/useApp';
import { AgenteFab } from './AgenteFab';
import { AgenteSidebar } from './AgenteSidebar';
import { despertarAgente } from './detectarGrafica';

export function Agente() {
  const { agenteAbierto, abrirAgente, cerrarAgente } = useApp();
  const fab = useRef<HTMLButtonElement>(null);
  useEffect(despertarAgente, []);
  const cerrar = () => { cerrarAgente(); fab.current?.focus(); };   // el foco vuelve al botón que lo abrió
  return (
    <>
      <AgenteFab ref={fab} onClick={abrirAgente} expandido={agenteAbierto} />
      {agenteAbierto && <AgenteSidebar onCerrar={cerrar} />}
    </>
  );
}
