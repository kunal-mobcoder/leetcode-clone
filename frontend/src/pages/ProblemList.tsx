import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProblems } from '../hooks/useProblems';
import { useMySubmissions } from '../hooks/useSubmission';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Search, Code, Flame, CheckCircle2 } from 'lucide-react';

export const ProblemList: React.FC = () => {
    const [difficulty, setDifficulty] = useState<string>('all');
    const [search, setSearch] = useState<string>('');
    const { user } = useAuth();

    const { data: problems, isLoading, error } = useProblems({
        difficulty: difficulty === 'all' ? undefined : difficulty,
        search: search.trim() ? search.trim() : undefined,
    });

    const { data: mySubmissions } = useMySubmissions(undefined, !!user);

    // Map of solved problem IDs
    const solvedProblemIds = useMemo(() => {
        if (!user || !Array.isArray(mySubmissions)) return new Set<string>();
        const set = new Set<string>();
        mySubmissions.forEach((sub: any) => {
            if (sub.status === 'accepted') {
                const pId = sub.problemId?._id?.toString() || sub.problemId?.toString();
                if (pId) set.add(pId);
            }
        });
        return set;
    }, [user, mySubmissions]);

    const problemList = Array.isArray(problems)
        ? problems
        : Array.isArray((problems as any)?.data)
            ? (problems as any).data
            : Array.isArray((problems as any)?.problems)
                ? (problems as any).problems
                : [];

    const easyCount = problemList.filter((p: any) => p.difficulty?.toLowerCase() === 'easy').length;
    const medCount = problemList.filter((p: any) => p.difficulty?.toLowerCase() === 'medium').length;
    const hardCount = problemList.filter((p: any) => p.difficulty?.toLowerCase() === 'hard').length;

    const solvedCount = problemList.filter((p: any) =>
        solvedProblemIds.has(p._id?.toString() || p.id?.toString())
    ).length;

    return (
        <div className="min-h-screen bg-chai-bg text-chai-text">
            {/* Header Hero */}
            <section className="border-b border-chai-border py-12 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-8 space-y-3">
                        <div className="flex items-center gap-2 text-chai-accent text-xs font-semibold uppercase tracking-wider">
                            <Flame className="w-4 h-4 fill-current" />
                            <span>Coding Practice Ground</span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
                            Master Algorithms & Data Structures
                        </h1>
                        <p className="text-chai-muted text-sm max-w-2xl leading-relaxed">
                            Solve curated technical interview problems with instant automated execution feedback, comprehensive test cases, and multi-language support.
                        </p>
                    </div>

                    <div className="lg:col-span-4 border border-chai-border bg-chai-card rounded-2xl p-5 space-y-3 text-xs">
                        <div className="flex items-center justify-between text-chai-muted font-mono uppercase text-[10px] tracking-wider">
                            <span>Problem Stats</span>
                            {user && (
                                <span className="text-green-400 font-semibold lowercase">
                                    {solvedCount} of {problemList.length} solved
                                </span>
                            )}
                        </div>
                        <div className="flex justify-between items-center text-sm font-semibold">
                            <span className="text-green-400">Easy: {easyCount}</span>
                            <span className="text-yellow-400">Medium: {medCount}</span>
                            <span className="text-red-400">Hard: {hardCount}</span>
                        </div>
                        <div className="text-[11px] text-chai-muted">
                            Total Available: <strong className="text-chai-text">{problemList.length}</strong>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filter and Problem Table */}
            <section className="max-w-7xl mx-auto px-6 py-8">
                {/* Search & Difficulty Filter Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-1.5 bg-chai-card border border-chai-border p-1 rounded-lg text-xs font-medium">
                        {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
                            <button
                                key={diff}
                                onClick={() => setDifficulty(diff)}
                                className={`px-3 py-1 rounded-md capitalize transition ${
                                    difficulty === diff
                                        ? 'bg-chai-accent text-black font-semibold'
                                        : 'text-chai-muted hover:text-chai-text'
                                }`}
                            >
                                {diff}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center bg-chai-card border border-chai-border rounded-lg px-3 py-1.5 text-xs w-full sm:w-72">
                        <Search className="w-3.5 h-3.5 text-chai-muted mr-2 flex-shrink-0" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by title or topic..."
                            className="bg-transparent focus:outline-none w-full text-chai-text placeholder:text-chai-muted text-xs"
                        />
                    </div>
                </div>

                {/* Table State */}
                {isLoading ? (
                    <div className="text-chai-muted text-sm py-16 text-center font-mono">
                        Loading problem set...
                    </div>
                ) : error ? (
                    <div className="text-red-400 text-sm py-16 text-center font-mono">
                        Error loading problems from server.
                    </div>
                ) : problemList.length === 0 ? (
                    <div className="text-chai-muted text-sm py-16 text-center border border-dashed border-chai-border rounded-xl">
                        No problems match the current filter.
                    </div>
                ) : (
                    <div className="border border-chai-border rounded-xl overflow-hidden bg-chai-card shadow-sm">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-chai-border bg-chai-bg text-chai-muted font-mono uppercase tracking-wider text-[11px]">
                                    <th className="py-3 px-6">Status</th>
                                    <th className="py-3 px-6">Problem</th>
                                    <th className="py-3 px-6">Tags</th>
                                    <th className="py-3 px-6">Difficulty</th>
                                    <th className="py-3 px-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-chai-border">
                                {problemList.map((prob: any) => {
                                    const probId = prob._id?.toString() || prob.id?.toString();
                                    const solved = solvedProblemIds.has(probId);

                                    return (
                                        <tr
                                            key={probId || prob.slug}
                                            className="hover:bg-chai-card-hover transition"
                                        >
                                            <td className="py-4 px-6 w-16">
                                                {solved ? (
                                                    <span title="Solved" className="text-green-400">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </span>
                                                ) : (
                                                    <span className="w-4 h-4 inline-block rounded-full border border-chai-border" />
                                                )}
                                            </td>
                                            <td className="py-4 px-6 font-medium text-chai-text">
                                                <Link
                                                    to={`/problems/${prob.slug}`}
                                                    className="hover:text-chai-accent transition flex items-center gap-2"
                                                >
                                                    <Code className="w-3.5 h-3.5 text-chai-muted" />
                                                    <span>{prob.title}</span>
                                                </Link>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {prob.tags && prob.tags.length > 0 ? (
                                                        prob.tags.map((tag: string) => (
                                                            <span
                                                                key={tag}
                                                                className="bg-chai-bg text-chai-muted px-2 py-0.5 rounded text-[10px] border border-chai-border font-mono"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-chai-muted text-[11px]">General</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border capitalize ${
                                                        prob.difficulty?.toLowerCase() === 'easy'
                                                            ? 'border-green-800 text-green-400 bg-green-950/30'
                                                            : prob.difficulty?.toLowerCase() === 'medium'
                                                                ? 'border-yellow-800 text-yellow-400 bg-yellow-950/30'
                                                                : 'border-red-800 text-red-400 bg-red-950/30'
                                                    }`}
                                                >
                                                    {prob.difficulty || 'easy'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <Link
                                                    to={`/problems/${prob.slug}`}
                                                    className="inline-flex items-center gap-1.5 bg-chai-bg hover:bg-chai-accent hover:text-black border border-chai-border text-chai-text px-3 py-1.5 rounded-lg transition font-medium text-xs"
                                                >
                                                    <span>{solved ? 'Solve Again' : 'Solve'}</span>
                                                    <ArrowRight className="w-3 h-3" />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};
