import { useEffect, useRef, useState } from 'react';
import { useApp } from '../state/useApp';
import { AgenteFab } from './AgenteFab';
import { AgenteSidebar, type Turno } from './AgenteSidebar';
import { despertarAgente } from './detectarGrafica';

export function Agente() {
  const { agenteAbierto, abrirAgente, cerrarAgente } = useApp();
  const fab = useRef<HTMLButtonElement>(null);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  useEffect(despertarAgente, []);
  const cerrar = () => { cerrarAgente(); fab.current?.focus(); };   // el foco vuelve al botón que lo abrió
  return (
    <>
      <AgenteFab ref={fab} onClick={abrirAgente} expandido={agenteAbierto} />
      {agenteAbierto && <AgenteSidebar onCerrar={cerrar} turnos={turnos} setTurnos={setTurnos} />}
    </>
  );
}
