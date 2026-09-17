import { useQuery } from '@tanstack/react-query';
import {
    fetchMatchHistory,
    fetchRanking,
} from '../../services/api/matchesApi';

export function useRankingQuery(enabled: boolean) {
    return useQuery({
        queryKey: ['ranking', 1],
        queryFn: () => fetchRanking(1),
        enabled,
        retry: 1,
    });
}

export function useMatchHistoryQuery(enabled: boolean) {
    return useQuery({
        queryKey: ['match-history', 1],
        queryFn: () => fetchMatchHistory(1),
        enabled,
        retry: 1,
    });
}
