import type { GameConfig } from '../game/config/gameConfig';

export type MatchEndReason = 'defeat' | 'timeout';

export interface RankingEntry {
    readonly position: number;
    readonly matchId: string;
    readonly playerId: string;
    readonly playerName: string;
    readonly score: number;
    readonly configKey: string;
}

export interface MatchHistoryEntry {
    readonly matchId: string;
    readonly playerId: string;
    readonly playerName: string;
    readonly date: string;
    readonly result: MatchEndReason;
    readonly score: number;
    readonly duration: string;
    readonly config: GameConfig;
    readonly configKey: string;
}

export interface PaginatedResponse<T> {
    readonly items: readonly T[];
    readonly page: number;
    readonly totalPages: number;
}

export interface MatchRegistration {
    readonly matchId: string;
    readonly playerId: string;
    readonly playerName: string;
    readonly date: string;
    readonly result: MatchEndReason;
    readonly score: number;
    readonly duration: string;
    readonly config: GameConfig;
    readonly configKey: string;
}
