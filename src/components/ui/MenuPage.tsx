import { MOCK_MATCH_HISTORY, MOCK_RANKING } from '../../mocks/menuData';
import type { AppScreen } from '../../types/menu';
import './Menu.css';

interface MenuPageProps {
    screen: Exclude<AppScreen, 'menu' | 'game'>;
    onBack: () => void;
}

const pageTitles: Record<MenuPageProps['screen'], string> = {
    options: 'Options',
    ranking: 'Ranking',
    history: 'Match History',
};

export function MenuPage({ screen, onBack }: MenuPageProps) {
    return (
        <section className="menu-screen" aria-labelledby="menu-page-title">
            <p className="menu-screen__eyebrow">Pirate Battle</p>
            <h2 id="menu-page-title">{pageTitles[screen]}</h2>
            {screen === 'options' && <OptionsContent />}
            {screen === 'ranking' && <RankingContent />}
            {screen === 'history' && <HistoryContent />}
            <button className="menu-screen__back" type="button" onClick={onBack}>
                Back
            </button>
        </section>
    );
}

function OptionsContent() {
    return (
        <div className="menu-screen__content">
            <p>Gameplay options will be available in a future update.</p>
            <p>Current arena: 800 x 600</p>
        </div>
    );
}

function RankingContent() {
    return (
        <div className="menu-screen__content">
            <table className="menu-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>
                    {MOCK_RANKING.map((entry) => (
                        <tr key={entry.position}>
                            <td>{entry.position}</td>
                            <td>{entry.playerName}</td>
                            <td>{entry.score}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function HistoryContent() {
    return (
        <div className="menu-screen__content">
            <table className="menu-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Result</th>
                        <th>Score</th>
                        <th>Duration</th>
                    </tr>
                </thead>
                <tbody>
                    {MOCK_MATCH_HISTORY.map((entry) => (
                        <tr key={`${entry.date}-${entry.score}`}>
                            <td>{entry.date}</td>
                            <td>{entry.result}</td>
                            <td>{entry.score}</td>
                            <td>{entry.duration}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
