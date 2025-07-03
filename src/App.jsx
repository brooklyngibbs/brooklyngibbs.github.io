import { useState } from 'react';
import BootScreen from './components/BootScreen';
import Desktop from './components/Desktop';

function App() {
  const [booted, setBooted] = useState(false);

  return (
    <div className="font-mono">
      {booted ? <Desktop /> : <BootScreen onFinish={() => setBooted(true)} />}
    </div>
  );
}

export default App;