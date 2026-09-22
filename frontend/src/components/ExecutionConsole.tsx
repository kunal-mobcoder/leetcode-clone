import React from 'react';
import { Loader2, CheckCircle2, XCircle, AlertTriangle, Clock } from 'lucide-react';
import type { SubmissionStatusResponse } from '../hooks/useSubmission';

interface Props {
    isSubmitting: boolean;
    submission: SubmissionStatusResponse | undefined;
}

export const ExecutionConsole: React.FC<Props> = ({ isSubmitting, submission }) => {
    if (isSubmitting || submission?.status === 'queued' || submission?.status === 'running') {
        return (
            <div className="flex items-center gap-3 text-amber-400 text-sm font-medium py-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Executing test cases inside Docker container...</span>
            </div>
        );
    }

    if (!submission) {
        return (
            <p className="text-slate-500 text-xs">
                Click <span className="text-slate-300 font-semibold">Submit</span> to evaluate your solution against test cases.
            </p>
        );
    }

    return (
        <div className="space-y-3">
            {/* Status Badges */}
            {submission.status === 'accepted' && (
                <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                        <CheckCircle2 className="w-5 h-5" /> Accepted
                    </div>
                    {submission.runtime !== undefined && (
                        <span className="text-xs text-slate-400 font-mono">
                            Runtime: <span className="text-slate-200 font-semibold">{submission.runtime} ms</span>
                        </span>
                    )}
                </div>
            )}

            {submission.status === 'wrong_answer' && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
                        <XCircle className="w-5 h-5" /> Wrong Answer
                    </div>
                    {submission.failedTestCase && (
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 font-mono text-xs space-y-1.5">
                            <div className="text-slate-400">Input: <span className="text-slate-200">{submission.failedTestCase.input}</span></div>
                            <div className="text-slate-400">Expected: <span className="text-emerald-400">{submission.failedTestCase.expectedOutput}</span></div>
                            <div className="text-slate-400">Actual: <span className="text-rose-400">{submission.failedTestCase.actualOutput}</span></div>
                        </div>
                    )}
                </div>
            )}

            {(submission.status === 'compile_error' || submission.status === 'runtime_error') && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
                        <AlertTriangle className="w-5 h-5" />
                        {submission.status === 'compile_error' ? 'Compilation Error' : 'Runtime Error'}
                    </div>
                    <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 font-mono text-xs text-rose-300 whitespace-pre-wrap overflow-x-auto max-h-32">
                        {submission.error || submission.failedTestCase?.actualOutput || 'Execution failed.'}
                    </pre>
                </div>
            )}

            {submission.status === 'time_limit_exceeded' && (
                <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                    <Clock className="w-5 h-5" /> Time Limit Exceeded
                </div>
            )}
        </div>
    );
};