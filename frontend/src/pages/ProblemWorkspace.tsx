import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Send, Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useSubmitCode, useSubmissionStatus } from '../hooks/useSubmission';

interface ProblemWorkspaceProps {
    problem: {
        id: string;
        title: string;
        description: string;
        difficulty: 'Easy' | 'Medium' | 'Hard';
        defaultCode?: Record<string, string>;
    };
}

const SUPPORTED_LANGUAGES = [
    { label: 'JavaScript', value: 'javascript', monaco: 'javascript' },
    { label: 'Python', value: 'python', monaco: 'python' },
    { label: 'Java', value: 'java', monaco: 'java' },
    { label: 'C++', value: 'cpp', monaco: 'cpp' },
];

export const ProblemWorkspace: React.FC<ProblemWorkspaceProps> = ({ problem }) => {
    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState(
        problem.defaultCode?.[language] || '// Write your solution here...\nfunction solution() {\n\n}'
    );
    const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);

    const submitMutation = useSubmitCode();
    const { data: submissionResult, isLoading: isPolling } = useSubmissionStatus(activeSubmissionId);

    const handleSubmit = async () => {
        try {
            const res = await submitMutation.mutateAsync({
                problemId: problem.id,
                language,
                code,
            });
            setActiveSubmissionId(res.id);
        } catch (err) {
            console.error('Submission failed:', err);
        }
    };

    const isExecuting = submitMutation.isPending || isPolling || submissionResult?.status === 'running';

    return (
        <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden">
            {/* Left Panel: Problem Statement */}
            <div className="w-1/2 p-6 overflow-y-auto border-r border-slate-800">
                <div className="flex items-center gap-3 mb-4">
                    <h1 className="text-2xl font-bold">{problem.title}</h1>
                    <span
                        className={`px-2.5 py-0.5 rounded text-xs font-semibold ${problem.difficulty === 'Easy'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : problem.difficulty === 'Medium'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                    >
                        {problem.difficulty}
                    </span>
                </div>
                <div className="prose prose-invert max-w-none text-slate-300">
                    <p className="whitespace-pre-line">{problem.description}</p>
                </div>
            </div>

            {/* Right Panel: Code Editor & Execution Results */}
            <div className="w-1/2 flex flex-col h-full bg-slate-950">
                {/* Editor Controls Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {SUPPORTED_LANGUAGES.map((lang) => (
                            <option key={lang.value} value={lang.value}>
                                {lang.label}
                            </option>
                        ))}
                    </select>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSubmit}
                            disabled={isExecuting}
                            className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white rounded font-medium text-sm transition-colors"
                        >
                            {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Submit
                        </button>
                    </div>
                </div>

                {/* Monaco Editor */}
                <div className="flex-1 min-h-0">
                    <Editor
                        height="100%"
                        theme="vs-dark"
                        language={SUPPORTED_LANGUAGES.find((l) => l.value === language)?.monaco || 'javascript'}
                        value={code}
                        onChange={(val) => setCode(val || '')}
                        options={{
                            fontSize: 14,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            tabSize: 2,
                        }}
                    />
                </div>

                {/* Execution Output Panel */}
                <div className="h-48 border-t border-slate-800 bg-slate-900 p-4 overflow-y-auto">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Test Console</h3>

                    {isExecuting && (
                        <div className="flex items-center gap-2 text-amber-400 text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Running code against test cases in Docker sandbox...
                        </div>
                    )}

                    {!isExecuting && submissionResult && (
                        <div className="space-y-2">
                            {submissionResult.status === 'accepted' && (
                                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-lg">
                                    <CheckCircle2 className="w-5 h-5" /> Accepted
                                    <span className="text-xs text-slate-400 font-normal">
                                        (Runtime: {submissionResult.runtime}ms)
                                    </span>
                                </div>
                            )}

                            {submissionResult.status === 'wrong_answer' && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-rose-400 font-semibold text-lg">
                                        <XCircle className="w-5 h-5" /> Wrong Answer
                                    </div>
                                    {submissionResult.failedTestCase && (
                                        <div className="bg-slate-950 p-3 rounded text-xs font-mono border border-slate-800 space-y-1">
                                            <p className="text-slate-400">Input: <span className="text-slate-200">{submissionResult.failedTestCase.input}</span></p>
                                            <p className="text-slate-400">Expected: <span className="text-emerald-400">{submissionResult.failedTestCase.expectedOutput}</span></p>
                                            <p className="text-slate-400">Actual: <span className="text-rose-400">{submissionResult.failedTestCase.actualOutput}</span></p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {(submissionResult.status === 'compile_error' || submissionResult.status === 'runtime_error') && (
                                <div>
                                    <div className="flex items-center gap-2 text-rose-400 font-semibold text-lg mb-1">
                                        <AlertTriangle className="w-5 h-5" /> {submissionResult.status === 'compile_error' ? 'Compilation Error' : 'Runtime Error'}
                                    </div>
                                    <pre className="bg-slate-950 p-3 rounded text-xs font-mono text-rose-300 border border-slate-800 whitespace-pre-wrap">
                                        {submissionResult.failedTestCase?.actualOutput || 'An error occurred during execution.'}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}

                    {!isExecuting && !submissionResult && (
                        <p className="text-slate-500 text-sm">Submit your code to view judgment output.</p>
                    )}
                </div>
            </div>
        </div>
    );
};