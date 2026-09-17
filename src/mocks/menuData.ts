import type {
    MatchHistoryEntry,
    RankingEntry,
} from '../types/menu';

export const MOCK_RANKING: readonly RankingEntry[] = [
    { position: 1, playerName: 'Captain Nova', score: 1250 },
    { position: 2, playerName: 'Sea Wolf', score: 980 },
    { position: 3, playerName: 'You', score: 750 },
];

export const MOCK_MATCH_HISTORY: readonly MatchHistoryEntry[] = [
    {
        date: '2026-09-17',
        result: 'Victory',
        score: 750,
        duration: '2:00',
    },
    {
        date: '2026-09-16',
        result: 'Game Over',
        score: 320,
        duration: '1:14',
    },
];
