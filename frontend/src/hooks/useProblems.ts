import { useQuery } from '@tanstack/react-query';
import axios, { api } from '../api/axios';

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
export const useProblems = () => {
    return useQuery({
        queryKey: ['problems'],
        queryFn: async () => {
            const response = await axios.get('/problems');
            const data = response.data;

            // Handle wrapped responses like { data: [...] } or { problems: [...] }
            if (Array.isArray(data)) return data;
            if (Array.isArray(data?.data)) return data.data;
            if (Array.isArray(data?.problems)) return data.problems;

            return [];
        },
    });
};

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