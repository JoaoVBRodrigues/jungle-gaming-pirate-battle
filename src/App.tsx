import { GameCanvas } from './game/rendering/GameCanvas';
import { GameHud } from './components/hud/GameHud';

function App() {
    return (
        <main>
            <h1>Pirate Battle</h1>
            <GameHud />
            <GameCanvas />
        </main>
    );
}

export default App;