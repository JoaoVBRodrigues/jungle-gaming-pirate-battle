import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerMatch } from '../../services/api/matchesApi';
import type { MatchRegistration } from '../../types/matches';

export function useRegisterMatch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (match: MatchRegistration) => registerMatch(match),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: ['ranking'],
            });
            void queryClient.invalidateQueries({
                queryKey: ['match-history'],
            });
        },
    });
}
