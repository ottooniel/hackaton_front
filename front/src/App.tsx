import { AppProvider } from './state/AppProvider';
import { Shell } from './shell/Shell';

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
