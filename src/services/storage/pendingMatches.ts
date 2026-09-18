import type { MatchRegistration } from '../../types/matches';

const PENDING_MATCHES_STORAGE_KEY = 'pirate-battle.pending-matches';

export function loadPendingMatches(): MatchRegistration[] {
    if (typeof window === 'undefined') {
        return [];
    }

    try {
        const storedMatches = window.localStorage.getItem(
            PENDING_MATCHES_STORAGE_KEY,
        );

        if (!storedMatches) {
            return [];
        }

        const parsedMatches = JSON.parse(storedMatches) as unknown;

        if (!Array.isArray(parsedMatches)) {
            return [];
        }

        return parsedMatches.filter(isMatchRegistration);
    } catch {
        return [];
    }
}

export function savePendingMatch(match: MatchRegistration): void {
    const pendingMatches = loadPendingMatches().filter(
        (pendingMatch) => pendingMatch.matchId !== match.matchId,
    );

    persistPendingMatches([...pendingMatches, match]);
}

export function removePendingMatch(matchId: string): void {
    persistPendingMatches(
        loadPendingMatches().filter(
            (pendingMatch) => pendingMatch.matchId !== matchId,
        ),
    );
}

function persistPendingMatches(matches: readonly MatchRegistration[]): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        if (matches.length === 0) {
            window.localStorage.removeItem(PENDING_MATCHES_STORAGE_KEY);
            return;
        }

        window.localStorage.setItem(
            PENDING_MATCHES_STORAGE_KEY,
            JSON.stringify(matches),
        );
    } catch {
        // Registration remains available for the current session when storage fails.
    }
}

function isMatchRegistration(value: unknown): value is MatchRegistration {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const match = value as Partial<MatchRegistration>;

    return (
        typeof match.matchId === 'string' &&
        typeof match.date === 'string' &&
        typeof match.result === 'string' &&
        typeof match.score === 'number' &&
        typeof match.duration === 'string'
    );
}
