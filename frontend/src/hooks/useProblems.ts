import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

export interface ProblemExample {
    input: string;
    output: string;
    explanation?: string;
}

export interface Problem {
    _id: string;
    title: string;
    slug: string;
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
    constraints?: string[];
    examples?: ProblemExample[];
    hints?: string[];
    description: string;
    starterCode?: Record<string, string>;
    defaultCode?: Record<string, string>;
    entryFunctionName?: string;
}

export interface ProblemsResponse {
    problems: Problem[];
    total: number;
    page: number;
    totalPages: number;
}

export interface TestCase {
    _id: string;
    input: string;
    expectedOutput: string;
    isHidden?: boolean;
}

interface ProblemsFilterParams {
    difficulty?: string;
    tag?: string;
    search?: string;
    page?: number;
    limit?: number;
}

// 1. Fetch paginated list of problems with optional filters
export const useProblems = (filters?: ProblemsFilterParams) => {
    return useQuery({
        queryKey: ['problems', filters],
        queryFn: async () => {
            const params: Record<string, any> = {};
            if (filters?.difficulty && filters.difficulty !== 'all') {
                params.difficulty = filters.difficulty;
            }
            if (filters?.tag) params.tag = filters.tag;
            if (filters?.search) params.search = filters.search;
            if (filters?.page) params.page = filters.page;
            if (filters?.limit) params.limit = filters.limit;

            const response = await api.get('/problems', { params });
            const data = response.data;

            if (Array.isArray(data)) return data;
            if (Array.isArray(data?.data)) return data.data;
            if (Array.isArray(data?.problems)) return data.problems;

            return [];
        },
    });
};

// 2. Fetch single problem details by slug
export function useProblemBySlug(slug?: string) {
    return useQuery({
        queryKey: ['problem', slug],
        queryFn: async () => {
            if (!slug) throw new Error("Slug is required");
            const { data } = await api.get<{ problem: Problem }>(`/problems/${slug}`);
            return data.problem;
        },
        enabled: !!slug,
    });
}

// 3. Fetch public test cases for problem workspace
export function usePublicTestCases(problemId?: string) {
    return useQuery({
        queryKey: ['testCases', 'public', problemId],
        queryFn: async () => {
            if (!problemId) return [];
            const { data } = await api.get<{ testCases: TestCase[] }>(
                `/problems/${problemId}/test-cases/public`
            );
            return data.testCases;
        },
        enabled: !!problemId,
    });
}
