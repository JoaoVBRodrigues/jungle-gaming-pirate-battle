import { useState } from 'react';
import { GameHud } from './components/hud/GameHud';
import { MainMenu } from './components/ui/MainMenu';
import { MenuPage } from './components/ui/MenuPage';
import { MatchResult } from './components/ui/MatchResult';
import { TouchControls } from './components/ui/TouchControls';
import { resetGameState } from './game/simulation/gameStateStore';
import { GameCanvas } from './game/rendering/GameCanvas';
import {
    createGameConfig,
    loadGameOptions,
} from './services/storage/gameOptions';
import type { GameConfig } from './game/config/gameConfig';
import type { AppScreen } from './types/menu';

function App() {
    const [screen, setScreen] = useState<AppScreen>('menu');
    const [gameKey, setGameKey] = useState(0);
    const [matchId, setMatchId] = useState('');
    const [gameConfig, setGameConfig] = useState<GameConfig>(() =>
        createGameConfig(loadGameOptions()),
    );

    function handlePlay() {
        resetGameState();
        setGameConfig(createGameConfig(loadGameOptions()));
        setMatchId(crypto.randomUUID());
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
        <main className={`app-shell app-shell--${screen}`}>
            <header className="app-header">
                <h1>Pirate Battle</h1>
                <p>Sailing the open sea</p>
            </header>
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
                    <GameCanvas key={gameKey} config={gameConfig} />
                    <TouchControls />
                    <MatchResult
                        onPlayAgain={handlePlayAgain}
                        onBackToMenu={handleBackToMenu}
                        matchId={matchId}
                        config={gameConfig}
                    />
                </>
            )}
        </main>
    );
}

export default App;