import { useQuery } from '@tanstack/react-query';
import { api } from '../api/axios';

export interface Problem {
    _id: string;
    title: string;
    slug: string;
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
    description: string;
    defaultCode?: Record<string, string>;
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
}

// 1. Fetch paginated list of problems
export function useProblems(page = 1, limit = 10, difficulty?: string) {
    return useQuery({
        queryKey: ['problems', page, limit, difficulty],
        queryFn: async () => {
            const { data } = await api.get<ProblemsResponse>('/problems', {
                params: { page, limit, difficulty },
            });
            return data;
        },
    });
}

// 2. Fetch single problem details by slug
export function useProblemBySlug(slug: string) {
    return useQuery({
        queryKey: ['problem', slug],
        queryFn: async () => {
            const { data } = await api.get<{ problem: Problem }>(`/problems/${slug}`);
            return data.problem;
        },
        enabled: !!slug,
    });
}

// 3. Fetch public test cases for problem workspace
export function usePublicTestCases(problemId: string | undefined) {
    return useQuery({
        queryKey: ['testCases', 'public', problemId],
        queryFn: async () => {
            const { data } = await api.get<{ testCases: TestCase[] }>(
                `/problems/${problemId}/test-cases/public`
            );
            return data.testCases;
        },
        enabled: !!problemId,
    });
}