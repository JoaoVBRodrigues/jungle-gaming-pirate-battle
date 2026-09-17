import axios from 'axios';
import type {
    MatchHistoryEntry,
    MatchRegistration,
    PaginatedResponse,
    RankingEntry,
} from '../../types/matches';

const matchesApi = axios.create({
    baseURL: '/api',
    timeout: 5000,
});

export async function fetchRanking(
    page = 1,
): Promise<PaginatedResponse<RankingEntry>> {
    const response = await matchesApi.get<PaginatedResponse<RankingEntry>>(
        '/ranking',
        { params: { page } },
    );
    return response.data;
}

export async function fetchMatchHistory(
    page = 1,
): Promise<PaginatedResponse<MatchHistoryEntry>> {
    const response = await matchesApi.get<
        PaginatedResponse<MatchHistoryEntry>
    >('/matches', { params: { page } });
    return response.data;
}

export async function registerMatch(
    match: MatchRegistration,
): Promise<MatchRegistration> {
    const response = await matchesApi.post<MatchRegistration>(
        '/matches',
        match,
    );
    return response.data;
}
