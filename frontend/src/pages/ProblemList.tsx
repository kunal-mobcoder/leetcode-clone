import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProblems } from '../hooks/useProblems';
import { Navbar } from '../components/Navbar';
import { ChevronLeft, ChevronRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

export const ProblemList: React.FC = () => {
    const [page, setPage] = useState(1);
    const [difficulty, setDifficulty] = useState<string | undefined>(undefined);

    const { data, isLoading, isError } = useProblems(page, 10, difficulty);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-8">
                {/* Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                            Problems
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                            Select a problem to practice your algorithms and data structures.
                        </p>
                    </div>

                    {/* Difficulty Filter */}
                    <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800/80 rounded-xl">
                        {['all', 'easy', 'medium', 'hard'].map((diff) => (
                            <button
                                key={diff}
                                onClick={() => {
                                    setDifficulty(diff === 'all' ? undefined : diff);
                                    setPage(1);
                                }}
                                className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200 ${(diff === 'all' && !difficulty) || difficulty === diff
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                    }`}
                            >
                                {diff}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading / Error States */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <span className="text-sm font-medium">Fetching problem set...</span>
                    </div>
                )}

                {isError && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-center text-sm">
                        Failed to connect to server. Check API connection.
                    </div>
                )}

                {/* Table */}
                {!isLoading && !isError && data && (
                    <div className="space-y-4">
                        <div className="glass-panel rounded-2xl overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-800/80 bg-slate-900/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        <th className="py-4 px-6">Status</th>
                                        <th className="py-4 px-6">Title</th>
                                        <th className="py-4 px-6">Category Tags</th>
                                        <th className="py-4 px-6">Difficulty</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50 text-sm">
                                    {data.problems.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-12 text-center text-slate-500">
                                                No problems matching selected filter.
                                            </td>
                                        </tr>
                                    ) : (
                                        data.problems.map((problem) => (
                                            <tr key={problem._id} className="hover:bg-slate-800/30 transition-colors group">
                                                <td className="py-4 px-6 w-12">
                                                    <CheckCircle2 className="w-4 h-4 text-slate-700 group-hover:text-slate-600" />
                                                </td>
                                                <td className="py-4 px-6 font-medium text-slate-200">
                                                    <Link
                                                        to={`/problems/${problem.slug}`}
                                                        className="hover:text-blue-400 transition-colors flex items-center gap-1.5"
                                                    >
                                                        {problem.title}
                                                    </Link>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {problem.tags?.map((tag) => (
                                                            <span
                                                                key={tag}
                                                                className="bg-slate-800/80 text-slate-300 text-xs px-2.5 py-0.5 rounded-md border border-slate-700/50"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span
                                                        className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize border ${problem.difficulty === 'easy'
                                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                            : problem.difficulty === 'medium'
                                                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                            }`}
                                                    >
                                                        {problem.difficulty}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex items-center justify-between px-2 pt-2">
                            <span className="text-xs text-slate-400">
                                Page <span className="font-bold text-slate-200">{data.page}</span> of{' '}
                                <span className="font-bold text-slate-200">{data.totalPages || 1}</span>
                            </span>
                            <div className="flex gap-2">
                                <button
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => p - 1)}
                                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 disabled:opacity-30 hover:bg-slate-800 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    disabled={page >= data.totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 disabled:opacity-30 hover:bg-slate-800 transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};