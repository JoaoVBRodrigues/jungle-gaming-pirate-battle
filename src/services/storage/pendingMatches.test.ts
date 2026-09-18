import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MatchRegistration } from '../../types/matches';
import { DEFAULT_GAME_CONFIG } from '../../game/config/gameConfig';
import {
    loadPendingMatches,
    removePendingMatch,
    savePendingMatch,
} from './pendingMatches';

const firstMatch: MatchRegistration = {
    matchId: 'match-1',
    date: '2026-09-17T12:00:00.000Z',
    result: 'timeout',
    score: 10,
    duration: '1:00',
    playerId: 'player-1',
    playerName: 'You',
    config: DEFAULT_GAME_CONFIG,
    configKey: 'default',
};

const replacementMatch: MatchRegistration = {
    ...firstMatch,
    score: 12,
};

const secondMatch: MatchRegistration = {
    ...firstMatch,
    matchId: 'match-2',
};

describe('pendingMatches', () => {
    const values = new Map<string, string>();

    beforeEach(() => {
        vi.stubGlobal('window', {
            localStorage: {
                getItem: (key: string) => values.get(key) ?? null,
                setItem: (key: string, value: string) => {
                    values.set(key, value);
                },
                removeItem: (key: string) => {
                    values.delete(key);
                },
            },
        });
    });

    afterEach(() => {
        values.clear();
        vi.unstubAllGlobals();
    });

    it('persists pending matches and replaces the same match id', () => {
        savePendingMatch(firstMatch);
        savePendingMatch(secondMatch);
        savePendingMatch(replacementMatch);

        expect(loadPendingMatches()).toEqual([
            secondMatch,
            replacementMatch,
        ]);
    });

    it('removes only the confirmed match', () => {
        savePendingMatch(firstMatch);
        savePendingMatch(secondMatch);

        removePendingMatch(firstMatch.matchId);

        expect(loadPendingMatches()).toEqual([secondMatch]);
    });
});
