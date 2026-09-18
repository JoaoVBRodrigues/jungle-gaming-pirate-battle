import { delay, http, HttpResponse } from 'msw';
import type {
    MatchHistoryEntry,
    MatchRegistration,
    PaginatedResponse,
    RankingEntry,
} from '../types/matches';

export type NetworkScenario =
    | 'success'
    | 'empty'
    | 'paginated'
    | 'slow'
    | 'out-of-order'
    | 'timeout'
    | 'server-error'
    | 'connection-error';

export const NETWORK_SCENARIO_STORAGE_KEY = 'pirate-battle.network-scenario';
const HISTORY_STORAGE_KEY = 'pirate-battle.mock-history';
const RANKING_STORAGE_KEY = 'pirate-battle.mock-ranking';
const PAGE_SIZE = 2;

const defaultConfig = {
    matchDurationSeconds: 120,
    player: { health: 100, movementSpeed: 150, rotationSpeed: 3 },
    frontalWeapon: { damage: 25, projectileSpeed: 400, projectileLifetimeSeconds: 2, cooldownSeconds: 0.5 },
    lateralWeapon: { damage: 15, projectileSpeed: 350, projectileLifetimeSeconds: 2, cooldownSeconds: 1 },
    chaser: { health: 50, movementSpeed: 80, rotationSpeed: 2, contactDamage: 25 },
    shooter: { health: 40, movementSpeed: 60, rotationSpeed: 2, contactDamage: 10, attackRange: 300, attackCooldownSeconds: 2, projectileSpeed: 250, projectileLifetimeSeconds: 5 },
    spawn: { intervalSeconds: 5, minimumDistanceFromPlayer: 250 },
} as const;

const ranking: RankingEntry[] = [
    { position: 1, matchId: 'fixture-1', playerId: 'fixture-nova', playerName: 'Captain Nova', score: 1250, configKey: 'default' },
    { position: 2, matchId: 'fixture-2', playerId: 'fixture-wolf', playerName: 'Sea Wolf', score: 980, configKey: 'default' },
    { position: 3, matchId: 'fixture-3', playerId: 'player-1', playerName: 'You', score: 750, configKey: 'default' },
];

const history: MatchHistoryEntry[] = [
    { matchId: 'mock-match-1', playerId: 'player-1', playerName: 'You', date: '2026-09-17', result: 'timeout', score: 750, duration: '2:00', config: defaultConfig, configKey: 'default' },
    { matchId: 'mock-match-2', playerId: 'player-1', playerName: 'You', date: '2026-09-16', result: 'defeat', score: 320, duration: '1:14', config: defaultConfig, configKey: 'default' },
];

const registeredMatchIds = new Set(history.map((match) => match.matchId));
loadPersistedMatches();

export function getNetworkScenario(): NetworkScenario {
    if (typeof window === 'undefined') return 'success';
    const value = window.localStorage.getItem(NETWORK_SCENARIO_STORAGE_KEY);
    return isNetworkScenario(value) ? value : 'success';
}

export function setNetworkScenario(scenario: NetworkScenario): void {
    window.localStorage.setItem(NETWORK_SCENARIO_STORAGE_KEY, scenario);
}

export function resetMockData(): void {
    window.localStorage.removeItem(HISTORY_STORAGE_KEY);
    window.localStorage.removeItem(RANKING_STORAGE_KEY);
    registeredMatchIds.clear();
    history.forEach((match) => registeredMatchIds.add(match.matchId));
}

export const handlers = [
    http.get('/api/ranking', async ({ request }) => {
        const scenario = getNetworkScenario();
        const response = scenarioResponse(scenario);
        if (response) return response;
        await applyScenarioDelay(scenario, request);
        return HttpResponse.json(paginate(scenario === 'empty' ? [] : ranking, getPage(request)));
    }),
    http.get('/api/matches', async ({ request }) => {
        const scenario = getNetworkScenario();
        const response = scenarioResponse(scenario);
        if (response) return response;
        await applyScenarioDelay(scenario, request);
        return HttpResponse.json(paginate(scenario === 'empty' ? [] : history, getPage(request)));
    }),
    http.post('/api/matches', async ({ request }) => {
        const scenario = getNetworkScenario();
        const response = scenarioResponse(scenario);
        if (response) return response;
        await applyScenarioDelay(scenario, request);
        const match = (await request.json()) as MatchRegistration;
        if (!registeredMatchIds.has(match.matchId)) {
            history.unshift(match);
            registeredMatchIds.add(match.matchId);
            ranking.push({ position: ranking.length + 1, matchId: match.matchId, playerId: match.playerId, playerName: match.playerName, score: match.score, configKey: match.configKey });
            ranking.sort((first, second) => second.score - first.score || first.matchId.localeCompare(second.matchId));
            ranking.forEach((entry, index) => { ranking[index] = { ...entry, position: index + 1 }; });
            persistMatches();
        }
        return HttpResponse.json(match, { status: 200 });
    }),
];

function paginate<T>(items: readonly T[], page: number): PaginatedResponse<T> {
    const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    const safePage = Math.min(Math.max(page, 1), totalPages);
    return { items: items.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE), page: safePage, totalPages };
}

function getPage(request: Request): number {
    return Number(new URL(request.url).searchParams.get('page')) || 1;
}

async function applyScenarioDelay(scenario: NetworkScenario, request: Request): Promise<void> {
    if (scenario === 'slow') await delay(900);
    if (scenario === 'out-of-order') await delay(getPage(request) === 1 ? 700 : 50);
}

function scenarioResponse(scenario: NetworkScenario): Response | undefined {
    if (scenario === 'timeout') return HttpResponse.json({ message: 'timeout' }, { status: 504 });
    if (scenario === 'server-error') return HttpResponse.json({ message: 'simulated failure' }, { status: 503 });
    if (scenario === 'connection-error') return HttpResponse.error();
    return undefined;
}

function isNetworkScenario(value: string | null): value is NetworkScenario {
    return ['success', 'empty', 'paginated', 'slow', 'out-of-order', 'timeout', 'server-error', 'connection-error'].includes(value ?? '');
}

function loadPersistedMatches(): void {
    if (typeof window === 'undefined') return;
    try {
        const storedHistory = window.localStorage.getItem(HISTORY_STORAGE_KEY);
        const storedRanking = window.localStorage.getItem(RANKING_STORAGE_KEY);
        if (storedHistory) {
            const parsed = JSON.parse(storedHistory) as MatchHistoryEntry[];
            history.splice(0, history.length, ...parsed);
            parsed.forEach((match) => registeredMatchIds.add(match.matchId));
        }
        if (storedRanking) ranking.splice(0, ranking.length, ...(JSON.parse(storedRanking) as RankingEntry[]));
    } catch { /* fixtures remain available */ }
}

function persistMatches(): void {
    try {
        window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
        window.localStorage.setItem(RANKING_STORAGE_KEY, JSON.stringify(ranking));
    } catch { /* mock remains usable when storage is unavailable */ }
}
