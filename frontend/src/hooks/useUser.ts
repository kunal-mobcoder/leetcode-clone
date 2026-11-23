import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

export interface UserProfileResponse {
    user: {
        id: string;
        username: string;
        email: string;
        roles: string[];
        createdAt: string;
    };
    stats: {
        solved: {
            total: number;
            easy: number;
            medium: number;
            hard: number;
        };
        totalProblems: {
            total: number;
            easy: number;
            medium: number;
            hard: number;
        };
        totalSubmissions: number;
        acceptedSubmissions: number;
        acceptanceRate: number;
    };
    recentSubmissions: Array<{
        _id: string;
        problemId: {
            _id: string;
            title: string;
            slug: string;
            difficulty: 'easy' | 'medium' | 'hard';
        };
        status: string;
        language: string;
        runtime?: number;
        createdAt: string;
    }>;
    submissionCalendar: Record<string, number>;
}

export function useUserProfile() {
    return useQuery({
        queryKey: ['userProfile'],
        queryFn: async () => {
            const res = await api.get<UserProfileResponse>('/users/profile');
            return res.data;
        },
    });
}
