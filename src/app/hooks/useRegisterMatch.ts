import { useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerMatch } from '../../services/api/matchesApi';
import {
    loadPendingMatches,
    removePendingMatch,
    savePendingMatch,
} from '../../services/storage/pendingMatches';
import type { MatchRegistration } from '../../types/matches';

export function useRegisterMatch() {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: (match: MatchRegistration) => registerMatch(match),
        onSuccess: (match) => {
            removePendingMatch(match.matchId);
            void queryClient.invalidateQueries({
                queryKey: ['ranking'],
            });
            void queryClient.invalidateQueries({
                queryKey: ['match-history'],
            });
        },
    });
    const { mutate } = mutation;

    const submitMatch = useCallback(
        (match: MatchRegistration) => {
            savePendingMatch(match);
            mutate(match);
        },
        [mutate],
    );

    useEffect(() => {
        for (const pendingMatch of loadPendingMatches()) {
            mutate(pendingMatch);
        }
    }, [mutate]);

    return {
        ...mutation,
        submitMatch,
    };
}
