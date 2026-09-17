import type { AppScreen } from '../../types/menu';
import './Menu.css';

interface MainMenuProps {
    onNavigate: (screen: Exclude<AppScreen, 'game' | 'menu'>) => void;
    onPlay: () => void;
}

export function MainMenu({ onNavigate, onPlay }: MainMenuProps) {
    return (
        <section className="menu-screen" aria-labelledby="main-menu-title">
            <p className="menu-screen__eyebrow">Pirate Battle</p>
            <h2 id="main-menu-title">Main Menu</h2>
            <div className="menu-screen__actions">
                <button type="button" onClick={onPlay}>
                    Play
                </button>
                <button type="button" onClick={() => onNavigate('options')}>
                    Options
                </button>
                <button type="button" onClick={() => onNavigate('ranking')}>
                    Ranking
                </button>
                <button
                    type="button"
                    onClick={() => onNavigate('history')}
                >
                    Match History
                </button>
            </div>
        </section>
    );
}
