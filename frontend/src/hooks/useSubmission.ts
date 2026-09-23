import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../api/axios';

export interface SubmissionPayload {
    problemId: string;
    language: string;
    code: string;
}

export interface SubmissionStatusResponse {
    _id?: string;
    id?: string;
    status: 'queued' | 'running' | 'accepted' | 'wrong_answer' | 'compile_error' | 'runtime_error' | 'time_limit_exceeded' | 'system_error';
    runtime?: number;
    failedTestCase?: {
        input: string;
        expectedOutput: string;
        actualOutput: string;
    };
    error?: string;
}

export function useSubmitCode() {
    return useMutation({
        mutationFn: async (payload: SubmissionPayload) => {
            // Makes request to Express backend
            const response = await api.post('/submissions', payload);
            // Handles both { id: "..." } and { submissionId: "..." } or { data: { _id: "..." } }
            return response.data;
        },
        onError: (error: any) => {
            console.error('Submission error:', error.response?.data || error.message);
        },
    });
}

export function useSubmissionStatus(submissionId: string | null) {
    return useQuery({
        queryKey: ['submission', submissionId],
        queryFn: async () => {
            const response = await api.get(`/submissions/${submissionId}`);
            // Extract submission object if backend wraps it as { submission: { status: '...' } }
            return response.data.submission || response.data;
        },
        enabled: !!submissionId,
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            // Continue polling while queued, running, or pending
            if (status && status !== 'queued' && status !== 'running' && status !== 'pending') {
                return false;
            }
            return 1000; // Poll every 1 second
        },
    });
}