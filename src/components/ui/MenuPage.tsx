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
import {
    getNetworkScenario,
    NETWORK_SCENARIO_STORAGE_KEY,
    resetMockData,
    setNetworkScenario,
    type NetworkScenario,
} from '../../mocks/handlers';
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
            {(screen === 'ranking' || screen === 'history') && <NetworkScenarioControls />}
            {screen === 'ranking' && <RankingContent />}
            {screen === 'history' && <HistoryContent />}
            <button className="menu-button menu-button--secondary menu-screen__back" type="button" onClick={onBack}>
                <img src={new URL('../../../assets/png/retina/ui/controls/icon_home.png', import.meta.url).href} alt="" aria-hidden="true" />
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
            <button className="menu-button menu-button--primary" type="submit">Save Options</button>
            {isSaved && <p role="status">Options saved.</p>}
        </form>
    );
}

const networkScenarios: readonly NetworkScenario[] = [
    'success', 'empty', 'paginated', 'slow', 'out-of-order', 'timeout', 'server-error', 'connection-error',
];

function NetworkScenarioControls() {
    const [scenario, setScenario] = useState<NetworkScenario>(getNetworkScenario);

    function changeScenario(value: NetworkScenario) {
        setScenario(value);
        setNetworkScenario(value);
        window.location.reload();
    }

    function resetScenario() {
        resetMockData();
        window.localStorage.removeItem(NETWORK_SCENARIO_STORAGE_KEY);
        setScenario('success');
        window.location.reload();
    }

    return (
        <div className="network-scenario-controls" aria-label="Network scenario controls">
            <label>
                Network scenario
                <select value={scenario} onChange={(event) => changeScenario(event.target.value as NetworkScenario)}>
                    {networkScenarios.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
            </label>
            <button className="menu-button menu-button--secondary" type="button" onClick={resetScenario}>Reset Mock Data</button>
        </div>
    );
}

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) {
    return (
        <nav className="menu-pagination" aria-label="Pagination">
            <button className="menu-button menu-button--secondary" type="button" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button className="menu-button menu-button--secondary" type="button" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Next</button>
        </nav>
    );
}

function RankingContent() {
    const [page, setPage] = useState(1);
    const query = useRankingQuery(true, page);

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
            <Pagination page={query.data.page} totalPages={query.data.totalPages} onChange={setPage} />
        </div>
    );
}

function HistoryContent() {
    const [page, setPage] = useState(1);
    const query = useMatchHistoryQuery(true, page);

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
            <Pagination page={query.data.page} totalPages={query.data.totalPages} onChange={setPage} />
        </div>
    );
}
