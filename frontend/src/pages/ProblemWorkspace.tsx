import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useProblems } from '../hooks/useProblems';
import { useSubmitCode, useSubmissionStatus } from '../hooks/useSubmission';
import { ExecutionConsole } from '../components/ExecutionConsole';
import { Play, Code2, Terminal, ChevronRight } from 'lucide-react';

export const ProblemWorkspace: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { data: problems } = useProblems();
    const problemData = problems?.find((p: any) => p.slug === slug);

    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState('');
    const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);

    const submitMutation = useSubmitCode();
    const { data: submissionStatus, isLoading: isPolling } = useSubmissionStatus(activeSubmissionId);

    // Set default code template when problem loads
    useEffect(() => {
        if (problemData?.defaultCode) {
            setCode(problemData.defaultCode[language] || `// Write your ${language} solution here`);
        } else {
            setCode(`function multiplyByTwo(n) {\n    return n * 2;\n}`);
        }
    }, [problemData, language]);

    const handleSubmit = async () => {
        if (!code.trim() || !problemData?._id) return;

        try {
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
        } catch (err) {
            console.error('Submission failed:', err);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-60px)] bg-chai-bg text-chai-text overflow-hidden">
            {/* Top Workspace Bar */}
            <div className="h-11 border-b border-chai-border px-6 flex items-center justify-between bg-chai-card text-xs">
                <div className="flex items-center gap-2 text-chai-muted">
                    <span>Problems</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-chai-text font-medium">{problemData?.title || slug}</span>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-chai-bg border border-chai-border text-chai-text px-2.5 py-1 rounded-md focus:outline-none text-xs font-mono"
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                    </select>

                    <button
                        onClick={handleSubmit}
                        disabled={submitMutation.isPending}
                        className="bg-chai-accent hover:bg-chai-accent-hover text-black font-semibold px-4 py-1.5 rounded-md flex items-center gap-1.5 transition text-xs disabled:opacity-50"
                    >
                        <Play className="w-3 h-3 fill-current" />
                        {submitMutation.isPending ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </div>

            {/* Main Split Grid */}
            <div className="flex-1 grid grid-cols-12 overflow-hidden">
                {/* Left Side: Problem Description */}
                <div className="col-span-5 border-r border-chai-border p-6 overflow-y-auto space-y-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight">{problemData?.title}</h1>
                        <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${problemData?.difficulty === 'Easy'
                                ? 'border-green-800 text-green-400 bg-green-950/30'
                                : 'border-yellow-800 text-yellow-400 bg-yellow-950/30'
                                }`}
                        >
                            {problemData?.difficulty || 'Easy'}
                        </span>
                    </div>

                    <div className="text-xs text-chai-muted leading-relaxed font-sans border-b border-chai-border pb-4">
                        {problemData?.description || 'Read a number and print its double.'}
                    </div>

                    {/* Example Section */}
                    <div className="space-y-2 pt-2">
                        <span className="text-xs font-semibold text-chai-text">Example 1:</span>
                        <div className="bg-chai-card border border-chai-border rounded-lg p-3 font-mono text-xs space-y-1">
                            <div><span className="text-chai-muted">Input:</span> n = 5</div>
                            <div><span className="text-chai-muted">Output:</span> 10</div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Monaco Code Editor + Execution Console */}
                <div className="col-span-7 flex flex-col bg-[#1e1e1e]">
                    {/* Monaco Editor Header */}
                    <div className="bg-chai-bg border-b border-chai-border px-4 py-2 flex items-center gap-2 text-xs text-chai-muted">
                        <Code2 className="w-3.5 h-3.5 text-chai-accent" />
                        <span className="font-mono">Code Editor</span>
                    </div>

                    {/* Monaco Editor Component */}
                    <div className="flex-1">
                        <Editor
                            height="100%"
                            theme="vs-dark"
                            language={language === 'cpp' ? 'cpp' : language}
                            value={code}
                            onChange={(value) => setCode(value || '')}
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

                    {/* Execution Output Panel */}
                    <div className="h-48 border-t border-chai-border bg-chai-card flex flex-col">
                        <div className="bg-chai-bg border-b border-chai-border px-4 py-2 flex items-center gap-2 text-xs text-chai-muted">
                            <Terminal className="w-3.5 h-3.5 text-chai-accent" />
                            <span className="font-mono">Execution Output</span>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <ExecutionConsole submission={submissionStatus} isLoading={isPolling} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};