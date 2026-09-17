import type { AppScreen } from '../../types/menu';
import './Menu.css';

interface MainMenuProps {
    onNavigate: (screen: Exclude<AppScreen, 'game' | 'menu'>) => void;
    onPlay: () => void;
}

export function MainMenu({ onNavigate, onPlay }: MainMenuProps) {
    return (
        <section className="menu-dashboard" aria-labelledby="main-menu-title">
            <div className="menu-panel menu-panel--controls">
                <div className="menu-panel__tabs">
                    <button className="is-active" type="button" onClick={onPlay}>
                        Play
                    </button>
                    <button type="button" onClick={() => onNavigate('options')}>
                        Options
                    </button>
                </div>

                <h2 id="main-menu-title">Main Menu</h2>
                <h3>Controls</h3>
                <dl className="control-list">
                    <div><dt>W / Up</dt><dd>Sail forward</dd></div>
                    <div><dt>A / Left</dt><dd>Turn to port</dd></div>
                    <div><dt>D / Right</dt><dd>Turn to starboard</dd></div>
                    <div><dt>Space</dt><dd>Bow cannon</dd></div>
                    <div><dt>Shift</dt><dd>Broadside volley</dd></div>
                    <div><dt>Escape</dt><dd>Pause or resume</dd></div>
                </dl>
                <p className="menu-panel__hint">
                    Touch controls are available in the arena on supported devices.
                </p>
            </div>

            <div className="menu-panel menu-panel--overview">
                <div className="menu-panel__tabs menu-panel__tabs--links">
                    <button className="is-active" type="button" onClick={() => onNavigate('ranking')}>
                        Ranking
                    </button>
                    <button type="button" onClick={() => onNavigate('history')}>
                        Match History
                    </button>
                </div>

                <h2>Captain's Log</h2>
                <p className="menu-panel__description">
                    Defeat enemy ships, protect your hull, and survive the full session.
                </p>
                <div className="menu-overview__actions">
                    <button type="button" onClick={onPlay}>Start a new voyage</button>
                    <button className="button-secondary" type="button" onClick={() => onNavigate('ranking')}>
                        View fleet standings
                    </button>
                </div>
            </div>
        </section>
    );
}
