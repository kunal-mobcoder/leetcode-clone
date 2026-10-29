import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Editor, { type OnMount } from '@monaco-editor/react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useProblemBySlug, usePublicTestCases } from '../hooks/useProblems';
import {
    useSubmitCode,
    useRunCode,
    useSubmissionStatus,
    useMySubmissions,
    type RunCodeResponse,
    type SubmissionItem,
} from '../hooks/useSubmission';
import { ExecutionConsole } from '../components/ExecutionConsole';
import {
    Play,
    Send,
    Code2,
    ChevronRight,
    FileText,
    History,
    CheckCircle2,
    XCircle,
    Clock,
    RotateCcw,
    Copy,
    Check,
    X,
    CheckCircle,
} from 'lucide-react';

export const ProblemWorkspace: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const { data: problemData, isLoading: isLoadingProblem, error: problemError } = useProblemBySlug(slug);
    const { data: publicTestCases } = usePublicTestCases(problemData?._id);
    const { data: pastSubmissions } = useMySubmissions(problemData?._id, !!user && !!problemData?._id);

    const [language, setLanguage] = useState<'javascript' | 'python'>('javascript');
    const [code, setCode] = useState('');
    const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);
    const [activeLeftTab, setActiveLeftTab] = useState<'description' | 'submissions'>('description');
    const [activeConsoleTab, setActiveConsoleTab] = useState<'testcase' | 'testresult' | 'submitresult'>('testcase');
    const [customInput, setCustomInput] = useState('');
    const [runResult, setRunResult] = useState<RunCodeResponse | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [viewingSubmission, setViewingSubmission] = useState<SubmissionItem | null>(null);
    const [copied, setCopied] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

    const submitMutation = useSubmitCode();
    const runMutation = useRunCode();
    const { data: submissionStatus, isLoading: isPolling } = useSubmissionStatus(activeSubmissionId);

    const runBtnRef = useRef<HTMLButtonElement>(null);
    const submitBtnRef = useRef<HTMLButtonElement>(null);

    // Storage key for auto-saving drafts
    const getStorageKey = (probSlug: string, lang: string) => `leetcode_draft_${probSlug}_${lang}`;

    // Has the current user solved this problem?
    const isSolved = pastSubmissions?.some((sub: any) => sub.status === 'accepted');

    // Get default template for language
    const getDefaultTemplate = (lang: 'javascript' | 'python') => {
        if (!problemData) return '';
        const starter = problemData.starterCode?.[lang] || problemData.defaultCode?.[lang];
        if (starter) return starter;
        return lang === 'javascript'
            ? `/**\n * @return {any}\n */\nfunction solution() {\n    // Write your code here\n}`
            : `class Solution:\n    def solution(self):\n        pass`;
    };

    // Load initial code (from draft or starter template)
    useEffect(() => {
        if (!problemData) return;

        const savedDraft = localStorage.getItem(getStorageKey(problemData.slug, language));
        if (savedDraft) {
            setCode(savedDraft);
        } else {
            setCode(getDefaultTemplate(language));
        }
    }, [problemData, language]);

    // Handle code change & auto-save draft
    const handleCodeChange = (newVal: string | undefined) => {
        const value = newVal || '';
        setCode(value);
        if (problemData) {
            setSaveStatus('saving');
            localStorage.setItem(getStorageKey(problemData.slug, language), value);
            setTimeout(() => setSaveStatus('saved'), 300);
        }
    };

    // Handle Reset Code
    const handleResetCode = () => {
        if (!problemData) return;
        const defaultCode = getDefaultTemplate(language);
        setCode(defaultCode);
        localStorage.removeItem(getStorageKey(problemData.slug, language));
    };

    // Auto-refresh past submissions when a new submission finishes
    useEffect(() => {
        if (submissionStatus?.status && submissionStatus.status !== 'pending' && submissionStatus.status !== 'running') {
            queryClient.invalidateQueries({ queryKey: ['mySubmissions', problemData?._id] });
        }
    }, [submissionStatus?.status, problemData?._id, queryClient]);

    // Handle "Run Code"
    const handleRunCode = async () => {
        if (!code.trim() || !problemData?._id || runMutation.isPending) return;

        try {
            setActiveConsoleTab('testresult');
            const res = await runMutation.mutateAsync({
                problemId: problemData._id,
                language,
                code,
                customInput: customInput.trim() ? customInput : undefined,
            });
            setRunResult(res);
        } catch (err: any) {
            console.error('Run code error:', err);
            const msg =
                err.response?.data?.error ||
                err.response?.data?.message ||
                err.message ||
                'Error executing code';
            setRunResult({
                status: 'failed',
                results: [
                    {
                        input: customInput || 'Sample test cases',
                        actualOutput: msg,
                        type: 'system_error',
                        runtime: 0,
                        passed: false,
                    },
                ],
            });
        }
    };

    // Handle "Submit"
    const handleSubmit = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (!code.trim() || !problemData?._id || submitMutation.isPending) return;

        try {
            setSubmitError(null);
            setActiveConsoleTab('submitresult');
            const res = await submitMutation.mutateAsync({
                problemId: problemData._id,
                language,
                code,
            });

            const newSubmissionId =
                res.submission?.id ||
                res.submission?._id ||
                res.id ||
                res._id ||
                res.submissionId;

            if (newSubmissionId) {
                setActiveSubmissionId(newSubmissionId);
            }
        } catch (err: any) {
            console.error('Submission failed:', err);
            const msg =
                err.response?.data?.error ||
                err.response?.data?.message ||
                err.message ||
                'Submission failed';
            setSubmitError(msg);
        }
    };

    // Keyboard Shortcuts (Window Level)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isModifier = e.metaKey || e.ctrlKey;
            if (isModifier && e.key === 'Enter') {
                e.preventDefault();
                if (e.shiftKey) {
                    submitBtnRef.current?.click();
                } else {
                    runBtnRef.current?.click();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Monaco Editor mount: Add command bindings inside editor
    const handleEditorMount: OnMount = (editor, monaco) => {
        // Cmd/Ctrl + Enter -> Run Code
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            runBtnRef.current?.click();
        });

        // Cmd/Ctrl + Shift + Enter -> Submit Solution
        editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter,
            () => {
                submitBtnRef.current?.click();
            }
        );
    };

    // Restore submitted code into active editor
    const handleRestoreSubmission = (sub: SubmissionItem) => {
        if (sub.language === 'javascript' || sub.language === 'python') {
            setLanguage(sub.language);
        }
        setCode(sub.code);
        if (problemData) {
            localStorage.setItem(getStorageKey(problemData.slug, sub.language), sub.code);
        }
        setViewingSubmission(null);
    };

    // Copy to clipboard
    const handleCopyCode = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoadingProblem) {
        return (
            <div className="flex-1 flex items-center justify-center font-mono text-xs text-chai-muted">
                Loading problem workspace...
            </div>
        );
    }

    if (problemError || !problemData) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
                <div className="text-red-400 font-mono text-sm">Problem not found.</div>
                <Link
                    to="/problems"
                    className="text-xs text-chai-accent hover:underline flex items-center gap-1 font-medium"
                >
                    Return to Problems
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-53px)] bg-chai-bg text-chai-text overflow-hidden">
            {/* Top Workspace Header */}
            <div className="h-11 border-b border-chai-border px-6 flex items-center justify-between bg-chai-card text-xs">
                <div className="flex items-center gap-2 text-chai-muted">
                    <Link to="/problems" className="hover:text-chai-text transition">Problems</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-chai-text font-medium">{problemData.title}</span>
                    {isSolved && (
                        <span className="flex items-center gap-1 text-[11px] text-green-400 bg-green-950/40 border border-green-800/60 px-2 py-0.5 rounded-full font-semibold ml-2">
                            <CheckCircle className="w-3 h-3" /> Solved
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as 'javascript' | 'python')}
                        className="bg-chai-bg border border-chai-border text-chai-text px-2.5 py-1 rounded-md focus:outline-none text-xs font-mono"
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                    </select>

                    <button
                        ref={runBtnRef}
                        onClick={handleRunCode}
                        disabled={runMutation.isPending || submitMutation.isPending}
                        className="bg-chai-bg hover:bg-chai-card border border-chai-border text-chai-text font-semibold px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition text-xs disabled:opacity-50"
                        title="Run solution (Ctrl+Enter / ⌘+Enter)"
                    >
                        <Play className="w-3 h-3 text-chai-accent fill-current" />
                        <span>{runMutation.isPending ? 'Running...' : 'Run'}</span>
                        <kbd className="hidden md:inline-block text-[10px] bg-chai-card border border-chai-border px-1 rounded text-chai-muted">
                            ⌘↵
                        </kbd>
                    </button>

                    <button
                        ref={submitBtnRef}
                        onClick={handleSubmit}
                        disabled={submitMutation.isPending || runMutation.isPending}
                        className="bg-chai-accent hover:bg-chai-accent-hover text-black font-semibold px-4 py-1.5 rounded-md flex items-center gap-1.5 transition text-xs disabled:opacity-50"
                        title="Submit code for full evaluation (Ctrl+Shift+Enter / ⌘+Shift+Enter)"
                    >
                        <Send className="w-3 h-3 fill-current" />
                        <span>{submitMutation.isPending ? 'Submitting...' : 'Submit'}</span>
                        <kbd className="hidden md:inline-block text-[10px] bg-black/20 border border-black/30 px-1 rounded text-black font-medium">
                            ⌘⇧↵
                        </kbd>
                    </button>
                </div>
            </div>

            {/* Main Split Grid */}
            <div className="flex-1 grid grid-cols-12 overflow-hidden">
                {/* Left Panel: Description & Submissions */}
                <div className="col-span-5 border-r border-chai-border flex flex-col bg-chai-bg overflow-hidden">
                    {/* Left Panel Tab Headers */}
                    <div className="flex items-center border-b border-chai-border bg-chai-card px-4 py-2 gap-4 text-xs">
                        <button
                            onClick={() => setActiveLeftTab('description')}
                            className={`flex items-center gap-1.5 transition ${
                                activeLeftTab === 'description'
                                    ? 'text-chai-accent font-semibold'
                                    : 'text-chai-muted hover:text-chai-text'
                            }`}
                        >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Description</span>
                        </button>
                        <button
                            onClick={() => setActiveLeftTab('submissions')}
                            className={`flex items-center gap-1.5 transition ${
                                activeLeftTab === 'submissions'
                                    ? 'text-chai-accent font-semibold'
                                    : 'text-chai-muted hover:text-chai-text'
                            }`}
                        >
                            <History className="w-3.5 h-3.5" />
                            <span>Submissions</span>
                            {pastSubmissions && pastSubmissions.length > 0 && (
                                <span className="bg-chai-border text-chai-text text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                                    {pastSubmissions.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Left Panel Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
                        {activeLeftTab === 'description' ? (
                            <div className="space-y-5">
                                {/* Title and Badge */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-xl font-bold tracking-tight text-chai-text">
                                            {problemData.title}
                                        </h1>
                                        <span
                                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border capitalize ${
                                                problemData.difficulty?.toLowerCase() === 'easy'
                                                    ? 'border-green-800 text-green-400 bg-green-950/30'
                                                    : problemData.difficulty?.toLowerCase() === 'medium'
                                                        ? 'border-yellow-800 text-yellow-400 bg-yellow-950/30'
                                                        : 'border-red-800 text-red-400 bg-red-950/30'
                                            }`}
                                        >
                                            {problemData.difficulty}
                                        </span>
                                    </div>

                                    {/* Tags */}
                                    {problemData.tags && problemData.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {problemData.tags.map((tag: string) => (
                                                <span
                                                    key={tag}
                                                    className="bg-chai-card text-chai-muted px-2 py-0.5 rounded text-[10px] border border-chai-border font-mono"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Problem Description */}
                                <div className="text-chai-text leading-relaxed whitespace-pre-wrap font-sans text-xs border-b border-chai-border pb-4">
                                    {problemData.description}
                                </div>

                                {/* Examples */}
                                {problemData.examples && problemData.examples.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="font-bold text-chai-text uppercase tracking-wider text-[11px]">
                                            Examples
                                        </h3>
                                        {problemData.examples.map((ex: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className="bg-chai-card border border-chai-border rounded-lg p-3 font-mono text-xs space-y-1.5"
                                            >
                                                <span className="text-chai-accent font-semibold block text-[11px]">
                                                    Example {idx + 1}:
                                                </span>
                                                <div>
                                                    <span className="text-chai-muted block text-[10px]">Input:</span>
                                                    <code className="text-chai-text bg-chai-bg px-2 py-0.5 rounded block whitespace-pre-wrap">
                                                        {ex.input}
                                                    </code>
                                                </div>
                                                <div>
                                                    <span className="text-chai-muted block text-[10px]">Output:</span>
                                                    <code className="text-green-400 bg-chai-bg px-2 py-0.5 rounded block whitespace-pre-wrap">
                                                        {ex.output}
                                                    </code>
                                                </div>
                                                {ex.explanation && (
                                                    <div className="text-[11px] text-chai-muted pt-1 font-sans">
                                                        <strong>Explanation:</strong> {ex.explanation}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Constraints */}
                                {problemData.constraints && problemData.constraints.length > 0 && (
                                    <div className="space-y-2 pt-2 border-t border-chai-border">
                                        <h3 className="font-bold text-chai-text uppercase tracking-wider text-[11px]">
                                            Constraints
                                        </h3>
                                        <ul className="list-disc list-inside space-y-1 text-chai-muted font-mono text-[11px]">
                                            {problemData.constraints.map((c: string, idx: number) => (
                                                <li key={idx}>
                                                    <code>{c}</code>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Submissions History Tab */
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-chai-text uppercase tracking-wider text-[11px]">
                                        Past Submissions
                                    </h3>
                                    <span className="text-[10px] text-chai-muted">
                                        Click a submission to view code
                                    </span>
                                </div>

                                {!pastSubmissions || pastSubmissions.length === 0 ? (
                                    <div className="text-chai-muted text-center py-12 font-mono border border-dashed border-chai-border rounded-xl">
                                        No submissions recorded yet for this problem.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {pastSubmissions.map((sub: SubmissionItem) => (
                                            <div
                                                key={sub._id || sub.id}
                                                onClick={() => setViewingSubmission(sub)}
                                                className="bg-chai-card hover:bg-chai-card-hover border border-chai-border hover:border-chai-border-subtle rounded-lg p-3 space-y-2 cursor-pointer transition group"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 font-bold">
                                                        {sub.status === 'accepted' ? (
                                                            <span className="text-green-400 flex items-center gap-1">
                                                                <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
                                                            </span>
                                                        ) : (
                                                            <span className="text-red-400 flex items-center gap-1">
                                                                <XCircle className="w-3.5 h-3.5" /> {sub.status.replace(/_/g, ' ').toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] text-chai-muted font-mono group-hover:text-chai-accent transition">
                                                        View Code →
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between text-[11px] text-chai-muted">
                                                    <span className="capitalize font-mono bg-chai-bg px-2 py-0.5 rounded border border-chai-border text-[10px]">
                                                        {sub.language}
                                                    </span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> {Math.round(sub.runtime || 0)} ms
                                                        </span>
                                                        <span className="text-[10px] text-chai-muted font-mono">
                                                            {new Date(sub.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Monaco Code Editor + Interactive Execution Console */}
                <div className="col-span-7 flex flex-col bg-[#1e1e1e] overflow-hidden">
                    {/* Monaco Editor Header */}
                    <div className="bg-chai-bg border-b border-chai-border px-4 py-2 flex items-center justify-between text-xs text-chai-muted">
                        <div className="flex items-center gap-2">
                            <Code2 className="w-3.5 h-3.5 text-chai-accent" />
                            <span className="font-mono">Code Solution ({language})</span>
                            <span className="text-[10px] text-chai-muted/70 italic">
                                • {saveStatus === 'saving' ? 'Saving draft...' : 'Draft saved'}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleResetCode}
                                className="flex items-center gap-1 text-[11px] text-chai-muted hover:text-chai-text transition"
                                title="Reset code to original starter template"
                            >
                                <RotateCcw className="w-3 h-3" />
                                <span>Reset Code</span>
                            </button>
                        </div>
                    </div>

                    {/* Monaco Editor Component */}
                    <div className="flex-1 overflow-hidden">
                        <Editor
                            height="100%"
                            theme="vs-dark"
                            language={language === 'python' ? 'python' : 'javascript'}
                            value={code}
                            onChange={handleCodeChange}
                            onMount={handleEditorMount}
                            options={{
                                fontSize: 13,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                tabSize: 2,
                                fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                            }}
                        />
                    </div>

                    {/* Interactive Execution Console */}
                    <div className="h-64 border-t border-chai-border bg-chai-card flex flex-col overflow-hidden">
                        <ExecutionConsole
                            submission={submissionStatus}
                            runResult={runResult}
                            isRunningCode={runMutation.isPending}
                            isSubmitting={isPolling || submitMutation.isPending}
                            submitError={submitError}
                            activeTab={activeConsoleTab}
                            setActiveTab={setActiveConsoleTab}
                            customInput={customInput}
                            setCustomInput={setCustomInput}
                            publicTestCases={publicTestCases}
                        />
                    </div>
                </div>
            </div>

            {/* Submission Code Viewer Modal */}
            {viewingSubmission && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6 backdrop-blur-xs">
                    <div className="bg-chai-card border border-chai-border rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-chai-border bg-chai-bg">
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-sm">Submission Details</span>
                                <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                        viewingSubmission.status === 'accepted'
                                            ? 'border-green-800 text-green-400 bg-green-950/30'
                                            : 'border-red-800 text-red-400 bg-red-950/30'
                                    }`}
                                >
                                    {viewingSubmission.status.replace(/_/g, ' ').toUpperCase()}
                                </span>
                                <span className="text-chai-muted text-xs font-mono">
                                    {new Date(viewingSubmission.createdAt).toLocaleString()}
                                </span>
                            </div>

                            <button
                                onClick={() => setViewingSubmission(null)}
                                className="text-chai-muted hover:text-chai-text p-1 rounded-lg transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Metrics Bar */}
                        <div className="grid grid-cols-3 border-b border-chai-border px-6 py-2.5 bg-chai-card text-xs text-chai-muted font-mono">
                            <div>
                                Language: <strong className="text-chai-text capitalize">{viewingSubmission.language}</strong>
                            </div>
                            <div>
                                Runtime: <strong className="text-chai-text">{Math.round(viewingSubmission.runtime || 0)} ms</strong>
                            </div>
                            <div className="text-right">
                                Status: <strong className="text-chai-text">{viewingSubmission.status}</strong>
                            </div>
                        </div>

                        {/* Modal Readonly Monaco Editor */}
                        <div className="flex-1 min-h-[300px] bg-[#1e1e1e]">
                            <Editor
                                height="320px"
                                theme="vs-dark"
                                language={viewingSubmission.language === 'python' ? 'python' : 'javascript'}
                                value={viewingSubmission.code}
                                options={{
                                    readOnly: true,
                                    fontSize: 13,
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                                }}
                            />
                        </div>

                        {/* Modal Action Footer */}
                        <div className="flex items-center justify-between px-6 py-3 border-t border-chai-border bg-chai-bg text-xs">
                            <button
                                onClick={() => handleCopyCode(viewingSubmission.code)}
                                className="flex items-center gap-1.5 text-chai-muted hover:text-chai-text transition px-3 py-1.5 rounded-lg border border-chai-border bg-chai-card"
                            >
                                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copied ? 'Copied to clipboard' : 'Copy Code'}</span>
                            </button>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setViewingSubmission(null)}
                                    className="px-4 py-1.5 text-chai-muted hover:text-chai-text transition"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => handleRestoreSubmission(viewingSubmission)}
                                    className="bg-chai-accent hover:bg-chai-accent-hover text-black font-semibold px-4 py-1.5 rounded-lg transition"
                                >
                                    Restore to Active Editor
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
