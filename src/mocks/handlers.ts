import { http, HttpResponse } from 'msw';
import type {
    MatchHistoryEntry,
    MatchRegistration,
    PaginatedResponse,
    RankingEntry,
} from '../types/matches';

const ranking: RankingEntry[] = [
    { position: 1, playerName: 'Captain Nova', score: 1250 },
    { position: 2, playerName: 'Sea Wolf', score: 980 },
    { position: 3, playerName: 'You', score: 750 },
];

const history: MatchHistoryEntry[] = [
    {
        matchId: 'mock-match-1',
        date: '2026-09-17',
        result: 'Victory',
        score: 750,
        duration: '2:00',
    },
    {
        matchId: 'mock-match-2',
        date: '2026-09-16',
        result: 'Game Over',
        score: 320,
        duration: '1:14',
    },
];

const registeredMatchIds = new Set(history.map((match) => match.matchId));
const HISTORY_STORAGE_KEY = 'pirate-battle.mock-history';
const RANKING_STORAGE_KEY = 'pirate-battle.mock-ranking';

loadPersistedMatches();

function paginate<T>(items: readonly T[], page: number): PaginatedResponse<T> {
    return {
        items,
        page,
        totalPages: 1,
    };
}

export const handlers = [
    http.get('/api/ranking', ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get('page')) || 1;
        return HttpResponse.json(paginate(ranking, page));
    }),
    http.get('/api/matches', ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get('page')) || 1;
        return HttpResponse.json(paginate(history, page));
    }),
    http.post('/api/matches', async ({ request }) => {
        const match = (await request.json()) as MatchRegistration;

        if (!registeredMatchIds.has(match.matchId)) {
            history.unshift(match);
            registeredMatchIds.add(match.matchId);
            ranking.push({
                position: ranking.length + 1,
                playerName: 'You',
                score: match.score,
            });
            ranking.sort((first, second) => second.score - first.score);
            ranking.splice(
                0,
                ranking.length,
                ...ranking.map((entry, index) => ({
                    ...entry,
                    position: index + 1,
                })),
            );
            persistMatches();
        }

        return HttpResponse.json(match, { status: 200 });
    }),
];

function loadPersistedMatches(): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        const storedHistory = window.localStorage.getItem(
            HISTORY_STORAGE_KEY,
        );
        const storedRanking = window.localStorage.getItem(
            RANKING_STORAGE_KEY,
        );

        if (storedHistory) {
            const parsedHistory = JSON.parse(storedHistory) as MatchHistoryEntry[];
            history.splice(0, history.length, ...parsedHistory);
            parsedHistory.forEach((match) => registeredMatchIds.add(match.matchId));
        }

        if (storedRanking) {
            const parsedRanking = JSON.parse(storedRanking) as RankingEntry[];
            ranking.splice(0, ranking.length, ...parsedRanking);
        }
    } catch {
        // Invalid mock data falls back to the fixtures above.
    }
}

function persistMatches(): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        window.localStorage.setItem(
            HISTORY_STORAGE_KEY,
            JSON.stringify(history),
        );
        window.localStorage.setItem(
            RANKING_STORAGE_KEY,
            JSON.stringify(ranking),
        );
    } catch {
        // The mock API remains usable when storage is unavailable.
    }
}
