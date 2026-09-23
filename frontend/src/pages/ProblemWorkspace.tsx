import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/axios';
import { useSubmitCode, useSubmissionStatus } from '../hooks/useSubmission';
import { ExecutionConsole } from '../components/ExecutionConsole';
import { Loader2 } from 'lucide-react';

export interface Problem {
    _id: string;
    title: string;
    slug: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
    defaultCode?: Record<string, string>;
}

export const ProblemWorkspace: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();

    const [language, setLanguage] = useState<'javascript' | 'python' | 'cpp' | 'java'>('javascript');
    const [code, setCode] = useState<string>('');
    const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);

    // 1. Fetch Problem Details by Slug
    const { data: problemData, isLoading: isLoadingProblem, error: problemError } = useQuery({
        queryKey: ['problem', slug],
        queryFn: async () => {
            const response = await api.get<{ problem: Problem }>(`/problems/${slug}`);
            return response.data.problem;
        },
        enabled: !!slug,
    });

    // 2. Set default starter code whenever problem or language changes
    useEffect(() => {
        if (problemData?.defaultCode?.[language]) {
            setCode(problemData.defaultCode[language]);
        } else if (problemData) {
            // Basic fallback starter code if defaultCode isn't provided by backend
            const fallbacks: Record<string, string> = {
                javascript: '// Write your solution here\nfunction main() {\n  \n}',
                python: '# Write your solution here\ndef main():\n    pass',
                cpp: '// Write your solution here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}',
                java: '// Write your solution here\npublic class Main {\n    public static void main(String[] args) {\n        \n    }\n}',
            };
            setCode(fallbacks[language] || '');
        }
    }, [problemData, language]);

    // 3. React Query Submission Hooks
    const submitMutation = useSubmitCode();
    const { data: submissionStatus } = useSubmissionStatus(activeSubmissionId);

    // const handleSubmit = async () => {
    //     if (!code.trim() || !problemData?._id) return;

    //     try {
    //         const response = await submitMutation.mutateAsync({
    //             problemId: problemData._id, // Must be MongoDB _id, not the URL slug
    //             language,
    //             code,
    //         });

    //         if (response?.id) {
    //             setActiveSubmissionId(response.id);
    //         }
    //     } catch (error) {
    //         console.error('Failed to submit solution:', error);
    //     }
    // };

    const handleSubmit = async () => {
        if (!code.trim() || !problemData?._id) return;

        try {
            const res = await submitMutation.mutateAsync({
                problemId: problemData._id,
                language,
                code,
            });

            // Extract submission ID from nested `submission` property
            const newSubmissionId =
                res.submission?.id ||
                res.submission?._id ||
                res.id ||
                res._id ||
                res.submissionId;

            if (newSubmissionId) {
                setActiveSubmissionId(newSubmissionId);
            } else {
                console.error('Submission ID missing in backend response:', res);
            }
        } catch (err) {
            console.error('Failed to execute submitMutation:', err);
        }
    };

    if (isLoadingProblem) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-300">
                <Loader2 className="w-8 h-8 animate-spin mr-3 text-indigo-500" />
                <span>Loading problem details...</span>
            </div>
        );
    }

    if (problemError || !problemData) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950 text-rose-400">
                <p>Failed to load problem. Please check if the slug is valid or if your backend API is running.</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
            {/* LEFT PANEL: Problem Details */}
            <div className="w-1/2 flex flex-col border-r border-slate-800 p-6 overflow-y-auto">
                <div className="flex items-center gap-3 mb-4">
                    <h1 className="text-2xl font-bold text-slate-100">{problemData.title}</h1>
                    <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${problemData.difficulty === 'easy'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : problemData.difficulty === 'medium'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                    >
                        {problemData.difficulty}
                    </span>
                </div>

                {/* Problem Description */}
                <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {problemData.description}
                </div>

                {/* Tags */}
                {problemData.tags && problemData.tags.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap gap-2">
                        {problemData.tags.map((tag) => (
                            <span key={tag} className="bg-slate-800 text-slate-400 text-xs px-2.5 py-1 rounded-md">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* RIGHT PANEL: Code Editor & Execution Console */}
            <div className="w-1/2 flex flex-col">
                {/* Editor Toolbar */}
                <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-900">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as any)}
                        className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                    </select>

                    <button
                        onClick={handleSubmit}
                        disabled={submitMutation.isPending}
                        className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm px-5 py-1.5 rounded-lg transition shadow-md flex items-center gap-2"
                    >
                        {submitMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        {submitMutation.isPending ? 'Submitting...' : 'Submit'}
                    </button>
                </div>

                {/* Code Input Area */}
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full flex-1 p-4 bg-slate-950 text-slate-100 font-mono text-sm leading-relaxed resize-none focus:outline-none"
                    placeholder="Write your code here..."
                />

                {/* Execution Output Console */}
                <div className="h-1/3 border-t border-slate-800 p-4 bg-slate-900 overflow-y-auto">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                        Execution Output
                    </h3>
                    <ExecutionConsole
                        isSubmitting={submitMutation.isPending}
                        submission={submissionStatus}
                    />
                </div>
            </div>
        </div>
    );
};