export type AppScreen =
    | 'menu'
    | 'options'
    | 'ranking'
    | 'history'
    | 'game';

export interface RankingEntry {
    readonly position: number;
    readonly playerName: string;
    readonly score: number;
}

export interface MatchHistoryEntry {
    readonly date: string;
    readonly result: string;
    readonly score: number;
    readonly duration: string;
}
