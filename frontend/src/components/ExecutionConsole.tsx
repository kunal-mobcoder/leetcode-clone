import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import type { RunCodeResponse } from '../hooks/useSubmission';

interface ExecutionConsoleProps {
    submission: any;
    runResult: RunCodeResponse | null;
    isRunningCode: boolean;
    isSubmitting: boolean;
    activeTab: 'testcase' | 'testresult' | 'submitresult';
    setActiveTab: (tab: 'testcase' | 'testresult' | 'submitresult') => void;
    customInput: string;
    setCustomInput: (input: string) => void;
    publicTestCases?: Array<{ input: string; expectedOutput: string }>;
}

export const ExecutionConsole: React.FC<ExecutionConsoleProps> = ({
    submission,
    runResult,
    isRunningCode,
    isSubmitting,
    activeTab,
    setActiveTab,
    customInput,
    setCustomInput,
    publicTestCases = [],
}) => {
    const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);

    // If currently submitting or evaluating
    if (isSubmitting) {
        return (
            <div className="flex items-center gap-2 text-chai-accent text-xs p-6 font-mono">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating submission against all test cases...</span>
            </div>
        );
    }

    if (isRunningCode) {
        return (
            <div className="flex items-center gap-2 text-chai-accent text-xs p-6 font-mono">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running solution against sample test cases...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full text-xs font-mono">
            {/* Console Sub-header Tabs */}
            <div className="flex items-center justify-between border-b border-chai-border px-4 py-2 bg-chai-bg text-[11px]">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setActiveTab('testcase')}
                        className={`transition ${
                            activeTab === 'testcase'
                                ? 'text-chai-accent font-semibold border-b-2 border-chai-accent pb-1 -mb-[9px]'
                                : 'text-chai-muted hover:text-chai-text'
                        }`}
                    >
                        Test Cases
                    </button>
                    <button
                        onClick={() => setActiveTab('testresult')}
                        className={`transition ${
                            activeTab === 'testresult'
                                ? 'text-chai-accent font-semibold border-b-2 border-chai-accent pb-1 -mb-[9px]'
                                : 'text-chai-muted hover:text-chai-text'
                        }`}
                    >
                        Run Result {runResult && (runResult.status === 'success' ? '✓' : '✗')}
                    </button>
                    {submission && (
                        <button
                            onClick={() => setActiveTab('submitresult')}
                            className={`transition ${
                                activeTab === 'submitresult'
                                    ? 'text-chai-accent font-semibold border-b-2 border-chai-accent pb-1 -mb-[9px]'
                                    : 'text-chai-muted hover:text-chai-text'
                            }`}
                        >
                            Submission Verdict
                        </button>
                    )}
                </div>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* 1. TEST CASE INPUT TAB */}
                {activeTab === 'testcase' && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            {publicTestCases.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setSelectedCaseIdx(idx);
                                        setCustomInput(publicTestCases[idx].input);
                                    }}
                                    className={`px-3 py-1 rounded text-[11px] border transition ${
                                        selectedCaseIdx === idx
                                            ? 'bg-chai-card text-chai-accent border-chai-accent font-bold'
                                            : 'bg-chai-bg text-chai-muted border-chai-border hover:text-chai-text'
                                    }`}
                                >
                                    Case {idx + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setSelectedCaseIdx(-1)}
                                className={`px-3 py-1 rounded text-[11px] border transition ${
                                    selectedCaseIdx === -1
                                        ? 'bg-chai-card text-chai-accent border-chai-accent font-bold'
                                        : 'bg-chai-bg text-chai-muted border-chai-border hover:text-chai-text'
                                }`}
                            >
                                Custom Input
                            </button>
                        </div>

                        <div>
                            <span className="text-[10px] text-chai-muted uppercase tracking-wider block mb-1">
                                Input (passed to stdin / function args):
                            </span>
                            <textarea
                                value={
                                    selectedCaseIdx >= 0 && publicTestCases[selectedCaseIdx]
                                        ? publicTestCases[selectedCaseIdx].input
                                        : customInput
                                }
                                onChange={(e) => {
                                    setSelectedCaseIdx(-1);
                                    setCustomInput(e.target.value);
                                }}
                                rows={3}
                                className="w-full bg-chai-bg border border-chai-border rounded-lg p-2.5 text-chai-text font-mono text-xs focus:outline-none focus:border-chai-accent"
                                placeholder="Enter custom input lines (e.g. [2,7,11,15]\n9)"
                            />
                        </div>
                    </div>
                )}

                {/* 2. RUN RESULT TAB */}
                {activeTab === 'testresult' && (
                    <div>
                        {!runResult ? (
                            <div className="text-chai-muted text-xs py-4 text-center">
                                Click <strong className="text-chai-text">Run Code</strong> to test against sample cases.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-chai-border pb-2">
                                    <div className="flex items-center gap-2 text-sm font-bold">
                                        {runResult.status === 'success' ? (
                                            <span className="text-green-400 flex items-center gap-1.5">
                                                <CheckCircle2 className="w-4 h-4" /> All Sample Cases Passed
                                            </span>
                                        ) : (
                                            <span className="text-red-400 flex items-center gap-1.5">
                                                <XCircle className="w-4 h-4" /> Tests Failed
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {runResult.results.map((res, i) => (
                                        <div
                                            key={i}
                                            className={`p-3 rounded-lg border text-xs space-y-2 ${
                                                res.passed
                                                    ? 'bg-green-950/10 border-green-900/50'
                                                    : 'bg-red-950/15 border-red-900/50'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between font-bold text-[11px]">
                                                <span>Case {i + 1}</span>
                                                <span className={res.passed ? 'text-green-400' : 'text-red-400'}>
                                                    {res.passed ? 'Passed' : res.type.replace('_', ' ').toUpperCase()} ({Math.round(res.runtime)}ms)
                                                </span>
                                            </div>

                                            <div>
                                                <span className="text-chai-muted text-[10px] block">Input:</span>
                                                <code className="bg-chai-bg px-2 py-1 rounded block text-chai-text mt-0.5">
                                                    {res.input}
                                                </code>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 pt-1">
                                                {res.expectedOutput !== undefined && (
                                                    <div>
                                                        <span className="text-chai-muted text-[10px] block">Expected:</span>
                                                        <code className="bg-chai-bg px-2 py-1 rounded block text-green-400 mt-0.5">
                                                            {res.expectedOutput}
                                                        </code>
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="text-chai-muted text-[10px] block">Your Output:</span>
                                                    <code className={`bg-chai-bg px-2 py-1 rounded block mt-0.5 ${res.passed ? 'text-green-400' : 'text-red-400'}`}>
                                                        {res.actualOutput || '(empty output)'}
                                                    </code>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 3. SUBMIT VERDICT TAB */}
                {activeTab === 'submitresult' && (
                    <div className="space-y-3">
                        {!submission ? (
                            <div className="text-chai-muted text-xs py-4 text-center">
                                Click <strong className="text-chai-text">Submit</strong> to evaluate your solution.
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center justify-between border-b border-chai-border pb-3">
                                    <div className="flex items-center gap-2">
                                        {submission.status === 'accepted' ? (
                                            <div className="flex items-center gap-1.5 text-green-400 font-bold text-sm">
                                                <CheckCircle2 className="w-5 h-5" /> Accepted
                                            </div>
                                        ) : submission.status === 'pending' || submission.status === 'running' || submission.status === 'queued' ? (
                                            <div className="flex items-center gap-1.5 text-chai-accent font-bold text-sm">
                                                <Loader2 className="w-4 h-4 animate-spin" /> {submission.status.toUpperCase()}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-red-400 font-bold text-sm">
                                                <XCircle className="w-5 h-5" /> {submission.status.replace(/_/g, ' ').toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    {submission.runtime !== undefined && (
                                        <div className="flex items-center gap-1 text-chai-muted text-[11px]">
                                            <Clock className="w-3.5 h-3.5" /> Runtime: {Math.round(submission.runtime)} ms
                                        </div>
                                    )}
                                </div>

                                {/* Failed Testcase Details */}
                                {submission.failedTestCase && (
                                    <div className="space-y-2 pt-2">
                                        <div className="text-chai-muted text-[10px] uppercase tracking-wider font-semibold">
                                            Failed Test Case
                                        </div>

                                        <div className="space-y-2 bg-chai-bg p-3 rounded-lg border border-chai-border text-[11px]">
                                            <div>
                                                <span className="text-chai-muted block mb-0.5">Input:</span>
                                                <code className="text-chai-text bg-chai-card px-2 py-1 rounded block">
                                                    {submission.failedTestCase.input}
                                                </code>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 pt-1">
                                                <div>
                                                    <span className="text-chai-muted block mb-0.5">Expected Output:</span>
                                                    <code className="text-green-400 bg-chai-card px-2 py-1 rounded block">
                                                        {submission.failedTestCase.expectedOutput}
                                                    </code>
                                                </div>
                                                <div>
                                                    <span className="text-chai-muted block mb-0.5">Your Output:</span>
                                                    <code className="text-red-400 bg-chai-card px-2 py-1 rounded block">
                                                        {submission.failedTestCase.actualOutput || '(no output)'}
                                                    </code>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
