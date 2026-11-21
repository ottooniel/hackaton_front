import { useEffect, useRef, useState } from 'react';
import { useApp } from '../state/useApp';
import { AgenteFab } from './AgenteFab';
import { AgenteSidebar, type Turno } from './AgenteSidebar';
import { despertarAgente } from './detectarGrafica';

export function Agente() {
  const { agenteAbierto, abrirAgente, cerrarAgente, cargado } = useApp();
  const fab = useRef<HTMLButtonElement>(null);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  // "Reiniciar la demostración" (cargado vuelve a false) también borra el historial del agente.
  const [cargadoAntes, setCargadoAntes] = useState(cargado);
  if (cargadoAntes !== cargado) {
    setCargadoAntes(cargado);
    if (!cargado) setTurnos([]);
  }
  useEffect(despertarAgente, []);
  const cerrar = () => { cerrarAgente(); fab.current?.focus(); };   // el foco vuelve al botón que lo abrió
  return (
    <>
      <AgenteFab ref={fab} onClick={abrirAgente} expandido={agenteAbierto} />
      {agenteAbierto && <AgenteSidebar onCerrar={cerrar} turnos={turnos} setTurnos={setTurnos} />}
    </>
  );
}
