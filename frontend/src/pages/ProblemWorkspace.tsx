import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Send, Loader2, CheckCircle2, XCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useProblemBySlug, usePublicTestCases } from '../hooks/useProblems';
import { useSubmitCode, useSubmissionStatus } from '../hooks/useSubmission';

const SUPPORTED_LANGUAGES = [
    { label: 'JavaScript', value: 'javascript', monaco: 'javascript' },
    { label: 'Python', value: 'python', monaco: 'python' },
    { label: 'Java', value: 'java', monaco: 'java' },
    { label: 'C++', value: 'cpp', monaco: 'cpp' },
];

export const ProblemWorkspace: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();

    const { data: problem, isLoading: isProblemLoading, isError } = useProblemBySlug(slug || '');
    const { data: publicTestCases } = usePublicTestCases(problem?._id);

    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState('');
    const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);

    const submitMutation = useSubmitCode();
    const { data: submissionResult, isLoading: isPolling } = useSubmissionStatus(activeSubmissionId);

    // Sync default code template when problem loads or language switches
    useEffect(() => {
        if (problem) {
            setCode(
                problem.defaultCode?.[language] ||
                `// Write your solution for ${problem.title}\n`
            );
        }
    }, [problem, language]);

    const handleSubmit = async () => {
        if (!problem) return;
        try {
            const res = await submitMutation.mutateAsync({
                problemId: problem._id,
                language,
                code,
            });
            setActiveSubmissionId(res.id);
        } catch (err) {
            console.error('Submission error:', err);
        }
    };

    const isExecuting = submitMutation.isPending || isPolling || submissionResult?.status === 'running';

    if (isProblemLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 gap-3">
                <Loader2 className="w-6 h-6 animate-spin" /> Loading problem workspace...
            </div>
        );
    }

    if (isError || !problem) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 gap-4">
                <p>Problem not found.</p>
                <Link to="/problems" className="text-blue-400 hover:underline flex items-center gap-1">
                    <ArrowLeft className="w-4 h-4" /> Back to Problem Directory
                </Link>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden">
            {/* Left Panel: Description & Sample Test Cases */}
            <div className="w-1/2 p-6 overflow-y-auto border-r border-slate-800 flex flex-col justify-between">
                <div>
                    <Link to="/problems" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 mb-4 transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Problems
                    </Link>
                    <div className="flex items-center gap-3 mb-4">
                        <h1 className="text-2xl font-bold">{problem.title}</h1>
                        <span
                            className={`px-2.5 py-0.5 rounded text-xs font-semibold capitalize ${problem.difficulty === 'easy'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : problem.difficulty === 'medium'
                                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}
                        >
                            {problem.difficulty}
                        </span>
                    </div>
                    <div className="prose prose-invert max-w-none text-slate-300 mb-8 whitespace-pre-line text-sm">
                        {problem.description}
                    </div>

                    {/* Sample Test Cases Section */}
                    {publicTestCases && publicTestCases.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Example Test Cases</h3>
                            {publicTestCases.map((tc, idx) => (
                                <div key={tc._id} className="bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono space-y-1">
                                    <span className="text-slate-500 font-bold">Case {idx + 1}:</span>
                                    <p className="text-slate-300">Input: <span className="text-slate-100">{tc.input}</span></p>
                                    <p className="text-slate-300">Expected Output: <span className="text-emerald-400">{tc.expectedOutput}</span></p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel: Code Editor & Console Output */}
            <div className="w-1/2 flex flex-col h-full bg-slate-950">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-3 py-1 text-sm focus:outline-none"
                    >
                        {SUPPORTED_LANGUAGES.map((lang) => (
                            <option key={lang.value} value={lang.value}>
                                {lang.label}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={handleSubmit}
                        disabled={isExecuting}
                        className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white rounded font-medium text-sm transition-colors"
                    >
                        {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Submit
                    </button>
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
                            automaticLayout: true,
                            tabSize: 2,
                        }}
                    />
                </div>

                {/* Execution Output Box */}
                <div className="h-48 border-t border-slate-800 bg-slate-900 p-4 overflow-y-auto">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Execution Console</h3>

                    {isExecuting && (
                        <div className="flex items-center gap-2 text-amber-400 text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Executing test cases in Docker sandbox...
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
                        <p className="text-slate-500 text-sm">Click Submit to process code execution against all test cases.</p>
                    )}
                </div>
            </div>
        </div>
    );
};