import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../api/axios";

export interface SubmissionResponse {
    id: string;
    problemId: string;
    language: string;
    status: 'pending' | 'running' | 'accepted' | 'wrong_answer' | 'time_limit_exceeded' | 'compile_error' | 'runtime_error' | 'system_error';
    runtime?: number;
    memory?: number;
    failedTestCase?: {
        input: string;
        expectedOutput: string;
        actualOutput: string;
    };
}

// Hook to poll submission status until finished
export function useSubmissionStatus(submissionId: string | null) {
    return useQuery({
        queryKey: ['submission', submissionId],
        queryFn: async () => {
            const { data } = await api.get<{ submission: SubmissionResponse }>(`/submissions/${submissionId}`);
            return data.submission;
        },
        enabled: !!submissionId,
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            return status === 'running' || status === 'pending' ? 1000 : false;
        },
    });
}

// Mutation to trigger a new submission
export function useSubmitCode() {
    return useMutation({
        mutationFn: async (payload: { problemId: string; language: string; code: string }) => {
            const { data } = await api.post<{ submission: { id: string } }>('/submissions', payload);
            return data.submission;
        },
    });
}