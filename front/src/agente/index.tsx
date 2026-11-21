import { useApp } from '../state/useApp';
import { AgenteFab } from './AgenteFab';
import { AgenteSidebar } from './AgenteSidebar';

export function Agente() {
  const { agenteAbierto, abrirAgente, cerrarAgente } = useApp();
  return (
    <>
      <AgenteFab onClick={abrirAgente} />
      {agenteAbierto && <AgenteSidebar onCerrar={cerrarAgente} />}
    </>
  );
}
