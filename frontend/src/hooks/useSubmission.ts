import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../api/axios';

export interface SubmissionPayload {
    problemId: string;
    language: string;
    code: string;
}

export interface RunCodePayload {
    problemId: string;
    language: string;
    code: string;
    customInput?: string;
}

export interface RunCodeResultItem {
    input: string;
    expectedOutput?: string;
    actualOutput: string;
    type: 'success' | 'timeout' | 'runtime_error' | 'compile_error' | 'system_error';
    runtime: number;
    passed?: boolean;
}

export interface RunCodeResponse {
    status: 'success' | 'failed';
    results: RunCodeResultItem[];
}

export interface SubmissionItem {
    _id: string;
    id?: string;
    problemId: string;
    language: string;
    status: 'pending' | 'running' | 'accepted' | 'wrong_answer' | 'compile_error' | 'runtime_error' | 'time_limit_exceeded' | 'system_error';
    runtime: number;
    memory: number;
    code: string;
    failedTestCase?: {
        input: string;
        expectedOutput: string;
        actualOutput: string;
    };
    createdAt: string;
}

export function useSubmitCode() {
    return useMutation({
        mutationFn: async (payload: SubmissionPayload) => {
            const response = await api.post('/submissions', payload);
            return response.data;
        },
        onError: (error: any) => {
            console.error('Submission error:', error.response?.data || error.message);
        },
    });
}

export function useRunCode() {
    return useMutation({
        mutationFn: async (payload: RunCodePayload) => {
            const response = await api.post<RunCodeResponse>('/submissions/run', payload);
            return response.data;
        },
        onError: (error: any) => {
            console.error('Run code error:', error.response?.data || error.message);
        },
    });
}

export function useSubmissionStatus(submissionId: string | null) {
    return useQuery({
        queryKey: ['submission', submissionId],
        queryFn: async () => {
            const response = await api.get(`/submissions/${submissionId}`);
            return response.data.submission || response.data;
        },
        enabled: !!submissionId,
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            if (status && status !== 'pending' && status !== 'running' && status !== 'queued') {
                return false;
            }
            return 1000;
        },
    });
}

export function useMySubmissions(problemId?: string, enabled: boolean = true) {
    return useQuery({
        queryKey: ['mySubmissions', problemId],
        queryFn: async () => {
            const params = problemId ? { problemId } : {};
            const response = await api.get('/submissions/my', { params });
            const data = response.data;
            if (Array.isArray(data)) return data;
            if (Array.isArray(data?.submissions)) return data.submissions;
            return [];
        },
        enabled,
    });
}
