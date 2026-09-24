import React from 'react';
import { CheckCircle2, XCircle, Clock, Loader2, AlertTriangle } from 'lucide-react';

interface ExecutionConsoleProps {
    submission: any;
    isLoading: boolean;
}

export const ExecutionConsole: React.FC<ExecutionConsoleProps> = ({ submission, isLoading }) => {
    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-chai-accent text-xs p-4 font-mono">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating submission test cases...</span>
            </div>
        );
    }

    if (!submission) {
        return (
            <div className="text-chai-muted text-xs p-4 font-mono">
                Click <strong className="text-chai-text">Submit</strong> to run your solution against test cases.
            </div>
        );
    }

    const { status, runtime, failedTestCase, error } = submission;

    return (
        <div className="p-4 font-mono text-xs space-y-3">
            {/* Status Badge */}
            <div className="flex items-center justify-between border-b border-chai-border pb-3">
                <div className="flex items-center gap-2">
                    {status === 'accepted' ? (
                        <div className="flex items-center gap-1.5 text-green-400 font-bold">
                            <CheckCircle2 className="w-4 h-4" /> Accepted
                        </div>
                    ) : status === 'pending' || status === 'running' || status === 'queued' ? (
                        <div className="flex items-center gap-1.5 text-chai-accent font-bold">
                            <Loader2 className="w-4 h-4 animate-spin" /> {status.toUpperCase()}
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-red-400 font-bold">
                            <XCircle className="w-4 h-4" /> {status.replace('_', ' ').toUpperCase()}
                        </div>
                    )}
                </div>

                {runtime !== undefined && (
                    <div className="flex items-center gap-1 text-chai-muted text-[11px]">
                        <Clock className="w-3 h-3" /> Runtime: {Math.round(runtime)} ms
                    </div>
                )}
            </div>

            {/* Error Message Display */}
            {error && (
                <div className="bg-red-950/30 border border-red-900 text-red-300 p-3 rounded-lg text-[11px] whitespace-pre-wrap">
                    {error}
                </div>
            )}

            {/* Failed Testcase Display */}
            {failedTestCase && (
                <div className="space-y-2 pt-1">
                    <div className="text-chai-muted text-[10px] uppercase tracking-wider font-semibold">
                        Failed Test Case
                    </div>

                    <div className="space-y-2 bg-chai-bg p-3 rounded-lg border border-chai-border text-[11px]">
                        <div>
                            <span className="text-chai-muted block mb-0.5">Input:</span>
                            <code className="text-chai-text bg-chai-card px-2 py-1 rounded block">{failedTestCase.input}</code>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                            <div>
                                <span className="text-chai-muted block mb-0.5">Expected Output:</span>
                                <code className="text-green-400 bg-chai-card px-2 py-1 rounded block">
                                    {failedTestCase.expectedOutput}
                                </code>
                            </div>
                            <div>
                                <span className="text-chai-muted block mb-0.5">Your Output:</span>
                                <code className="text-red-400 bg-chai-card px-2 py-1 rounded block">
                                    {failedTestCase.actualOutput || 'no output'}
                                </code>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};