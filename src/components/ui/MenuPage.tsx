import { useState, type FormEvent } from 'react';
import {
    useMatchHistoryQuery,
    useRankingQuery,
} from '../../app/hooks/useMatchQueries';
import {
    loadGameOptions,
    saveGameOptions,
} from '../../services/storage/gameOptions';
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
    const [options, setOptions] = useState(loadGameOptions);
    const [isSaved, setIsSaved] = useState(false);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const savedOptions = saveGameOptions(options);
        setOptions(savedOptions);
        setIsSaved(true);
    }

    return (
        <form className="menu-screen__content options-form" onSubmit={handleSubmit}>
            <label>
                Game session time (60-180 seconds)
                <input
                    type="number"
                    min="60"
                    max="180"
                    value={options.matchDurationSeconds}
                    onChange={(event) => {
                        setOptions({
                            ...options,
                            matchDurationSeconds: Number(event.target.value),
                        });
                        setIsSaved(false);
                    }}
                />
            </label>
            <label>
                Enemy spawn time (1-30 seconds)
                <input
                    type="number"
                    min="1"
                    max="30"
                    value={options.spawnIntervalSeconds}
                    onChange={(event) => {
                        setOptions({
                            ...options,
                            spawnIntervalSeconds: Number(event.target.value),
                        });
                        setIsSaved(false);
                    }}
                />
            </label>
            <button type="submit">Save Options</button>
            {isSaved && <p role="status">Options saved.</p>}
        </form>
    );
}

function RankingContent() {
    const query = useRankingQuery(true);

    if (query.isLoading) {
        return <p role="status">Loading ranking...</p>;
    }

    if (query.isError) {
        return <p role="alert">Unable to load ranking.</p>;
    }

    if (!query.data || query.data.items.length === 0) {
        return <p>No ranking entries yet.</p>;
    }

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
                    {query.data.items.map((entry) => (
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
    const query = useMatchHistoryQuery(true);

    if (query.isLoading) {
        return <p role="status">Loading match history...</p>;
    }

    if (query.isError) {
        return <p role="alert">Unable to load match history.</p>;
    }

    if (!query.data || query.data.items.length === 0) {
        return <p>No matches recorded yet.</p>;
    }

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
                    {query.data.items.map((entry) => (
                        <tr key={entry.matchId}>
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
