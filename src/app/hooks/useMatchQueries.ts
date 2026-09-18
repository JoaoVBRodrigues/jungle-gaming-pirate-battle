import { useQuery } from '@tanstack/react-query';
import {
    fetchMatchHistory,
    fetchRanking,
} from '../../services/api/matchesApi';

export function useRankingQuery(enabled: boolean, page = 1) {
    return useQuery({
        queryKey: ['ranking', page],
        queryFn: () => fetchRanking(page),
        enabled,
        retry: 1,
    });
}

export function useMatchHistoryQuery(enabled: boolean, page = 1) {
    return useQuery({
        queryKey: ['match-history', page],
        queryFn: () => fetchMatchHistory(page),
        enabled,
        retry: 1,
    });
}
