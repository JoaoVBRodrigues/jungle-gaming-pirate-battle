export interface RankingEntry {
    readonly position: number;
    readonly playerName: string;
    readonly score: number;
}

export interface MatchHistoryEntry {
    readonly matchId: string;
    readonly date: string;
    readonly result: string;
    readonly score: number;
    readonly duration: string;
}

export interface PaginatedResponse<T> {
    readonly items: readonly T[];
    readonly page: number;
    readonly totalPages: number;
}

export interface MatchRegistration {
    readonly matchId: string;
    readonly date: string;
    readonly result: string;
    readonly score: number;
    readonly duration: string;
}
