import { Paso3 } from './resultado';
import { Agente } from './agente';
import { AppProvider } from './state/AppProvider';

// ponytail: sin Shell todavía (Fase 1); se montan las piezas de B para que puedan probarlas.
export default function App() {
  return (
    <AppProvider>
      <Paso3 />
      <Agente />
    </AppProvider>
  );
}
