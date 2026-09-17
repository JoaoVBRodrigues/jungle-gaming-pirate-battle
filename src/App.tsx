import { useState } from 'react';
import { GameHud } from './components/hud/GameHud';
import { MainMenu } from './components/ui/MainMenu';
import { MenuPage } from './components/ui/MenuPage';
import { MatchResult } from './components/ui/MatchResult';
import { resetGameState } from './game/simulation/gameStateStore';
import { GameCanvas } from './game/rendering/GameCanvas';
import type { AppScreen } from './types/menu';

function App() {
    const [screen, setScreen] = useState<AppScreen>('menu');
    const [gameKey, setGameKey] = useState(0);

    function handlePlay() {
        resetGameState();
        setGameKey((currentKey) => currentKey + 1);
        setScreen('game');
    }

    function handlePlayAgain() {
        handlePlay();
    }

    function handleBackToMenu() {
        resetGameState();
        setScreen('menu');
    }

    return (
        <main>
            <h1>Pirate Battle</h1>
            {screen === 'menu' && (
                <MainMenu
                    onNavigate={setScreen}
                    onPlay={handlePlay}
                />
            )}
            {screen !== 'menu' && screen !== 'game' && (
                <MenuPage
                    screen={screen}
                    onBack={handleBackToMenu}
                />
            )}
            {screen === 'game' && (
                <>
                    <GameHud />
                    <GameCanvas key={gameKey} />
                    <MatchResult
                        onPlayAgain={handlePlayAgain}
                        onBackToMenu={handleBackToMenu}
                    />
                </>
            )}
        </main>
    );
}

export default App;