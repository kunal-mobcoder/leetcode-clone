import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../api/axios';

export interface SubmissionPayload {
    problemId: string;
    language: string;
    code: string;
}

export interface TestCaseResult {
    input: string;
    expectedOutput: string;
    actualOutput: string;
}

export interface SubmissionStatusResponse {
    id: string;
    status: 'queued' | 'running' | 'accepted' | 'wrong_answer' | 'compile_error' | 'runtime_error' | 'time_limit_exceeded';
    runtime?: number;
    memory?: number;
    failedTestCase?: TestCaseResult;
    error?: string;
}

// 1. Trigger Code Execution
export function useSubmitCode() {
    return useMutation({
        mutationFn: async (payload: SubmissionPayload) => {
            const { data } = await api.post<{ id: string }>('/submissions', payload);
            return data;
        },
    });
}

// 2. Poll Execution Status
export function useSubmissionStatus(submissionId: string | null) {
    return useQuery({
        queryKey: ['submission', submissionId],
        queryFn: async () => {
            const { data } = await api.get<SubmissionStatusResponse>(`/submissions/${submissionId}`);
            return data;
        },
        enabled: !!submissionId,
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            // Stop polling once Docker finishes execution
            if (status && status !== 'queued' && status !== 'running') {
                return false;
            }
            return 1000; // Poll every 1s while running or queued
        },
    });
}