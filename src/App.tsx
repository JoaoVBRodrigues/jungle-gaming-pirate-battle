import { useState } from 'react';
import { GameHud } from './components/hud/GameHud';
import { MatchResult } from './components/ui/MatchResult';
import { resetGameState } from './game/simulation/gameStateStore';
import { GameCanvas } from './game/rendering/GameCanvas';

function App() {
    const [gameKey, setGameKey] = useState(0);

    function handlePlayAgain() {
        resetGameState();
        setGameKey((currentKey) => currentKey + 1);
    }

    return (
        <main>
            <h1>Pirate Battle</h1>
            <GameHud />
            <GameCanvas key={gameKey} />
            <MatchResult onPlayAgain={handlePlayAgain} />
        </main>
    );
}

export default App;