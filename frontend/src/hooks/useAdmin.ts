import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import type { Problem } from './useProblems';

export interface AdminProblemItem extends Problem {
    status: 'draft' | 'published' | 'archived';
    createdAt: string;
    updatedAt: string;
}

export interface AdminTestCaseItem {
    _id: string;
    problemId: string;
    input: string;
    expectedOutput: string;
    isHidden: boolean;
    createdAt?: string;
}

export interface CreateProblemPayload {
    title: string;
    slug: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    tags?: string[];
    constraints?: string[];
    hints?: string[];
    examples?: Array<{
        input: string;
        output: string;
        explanation?: string;
    }>;
    starterCode?: Record<string, string>;
    entryFunctionName?: string;
}

export interface UpdateProblemPayload extends Partial<CreateProblemPayload> {}

export interface CreateTestCasePayload {
    input: string;
    expectedOutput: string;
    isHidden: boolean;
}

// 1. Fetch all problems for admin
export function useAdminProblems(status?: string, search?: string) {
    return useQuery({
        queryKey: ['adminProblems', status, search],
        queryFn: async () => {
            const params: Record<string, any> = { limit: 100 };
            if (status && status !== 'all') params.status = status;
            if (search && search.trim()) params.search = search.trim();
            const res = await api.get('/problems/admin/all', { params });
            const data = res.data;
            if (Array.isArray(data)) return data;
            if (Array.isArray(data?.problems)) return data.problems as AdminProblemItem[];
            return [] as AdminProblemItem[];
        },
    });
}

// 2. Fetch single problem by ID for admin editor
export function useAdminProblem(id?: string) {
    return useQuery({
        queryKey: ['adminProblem', id],
        queryFn: async () => {
            if (!id) throw new Error('Problem ID is required');
            const res = await api.get<{ problem: AdminProblemItem }>(`/problems/admin/${id}`);
            return res.data.problem;
        },
        enabled: !!id,
    });
}

// 3. Create problem mutation
export function useCreateProblem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: CreateProblemPayload) => {
            const res = await api.post('/problems', payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminProblems'] });
            queryClient.invalidateQueries({ queryKey: ['problems'] });
        },
    });
}

// 4. Update problem mutation
export function useUpdateProblem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateProblemPayload }) => {
            const res = await api.patch(`/problems/${id}`, data);
            return res.data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['adminProblems'] });
            queryClient.invalidateQueries({ queryKey: ['adminProblem', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['problems'] });
        },
    });
}

// 5. Update problem status (publish, draft, archive)
export function useUpdateProblemStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status }: { id: string; status: 'draft' | 'published' | 'archived' }) => {
            const res = await api.patch(`/problems/${id}/status`, { status });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminProblems'] });
            queryClient.invalidateQueries({ queryKey: ['problems'] });
        },
    });
}

// 6. Fetch all test cases for problem
export function useAdminTestCases(problemId?: string) {
    return useQuery({
        queryKey: ['adminTestCases', problemId],
        queryFn: async () => {
            if (!problemId) return [];
            const res = await api.get<{ testCases: AdminTestCaseItem[] }>(
                `/problems/${problemId}/test-cases`
            );
            return res.data.testCases || [];
        },
        enabled: !!problemId,
    });
}

// 7. Create test case
export function useCreateTestCase() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ problemId, data }: { problemId: string; data: CreateTestCasePayload }) => {
            const res = await api.post(`/problems/${problemId}/test-cases`, data);
            return res.data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['adminTestCases', variables.problemId] });
            queryClient.invalidateQueries({ queryKey: ['testCases', 'public', variables.problemId] });
        },
    });
}

// 8. Update test case
export function useUpdateTestCase() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            problemId,
            testCaseId,
            data,
        }: {
            problemId: string;
            testCaseId: string;
            data: Partial<CreateTestCasePayload>;
        }) => {
            const res = await api.patch(`/problems/${problemId}/test-cases/${testCaseId}`, data);
            return res.data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['adminTestCases', variables.problemId] });
            queryClient.invalidateQueries({ queryKey: ['testCases', 'public', variables.problemId] });
        },
    });
}

// 9. Delete test case
export function useDeleteTestCase() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ problemId, testCaseId }: { problemId: string; testCaseId: string }) => {
            const res = await api.delete(`/problems/${problemId}/test-cases/${testCaseId}`);
            return res.data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['adminTestCases', variables.problemId] });
            queryClient.invalidateQueries({ queryKey: ['testCases', 'public', variables.problemId] });
        },
    });
}
