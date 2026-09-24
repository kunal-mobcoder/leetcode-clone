import React from 'react';
import { Link } from 'react-router-dom';
import { useProblems } from '../hooks/useProblems';
import { ArrowRight, Search } from 'lucide-react';

export const ProblemList: React.FC = () => {
    const { data: problems, isLoading, error } = useProblems();

    // Ensure problemList is strictly an array
    const problemList = Array.isArray(problems)
        ? problems
        : Array.isArray((problems as any)?.data)
            ? (problems as any).data
            : Array.isArray((problems as any)?.problems)
                ? (problems as any).problems
                : [];

    return (
        <div className="min-h-screen bg-chai-bg text-chai-text">
            {/* Hero Header Section */}
            <section className="border-b border-chai-border py-16 px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-7 space-y-4">
                        <span className="text-chai-accent text-xs font-semibold uppercase tracking-wider">
                            Your preparation ground
                        </span>
                        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                            Prepare by seeing <br />
                            how it actually works.
                        </h1>
                        <p className="text-chai-muted text-sm max-w-xl leading-relaxed">
                            Algorithms and data structures animated one step at a time. Practice with problem sets, test cases, and immediate execution feedback.
                        </p>
                    </div>

                    {/* Visual Two Pointers Widget */}
                    <div className="lg:col-span-5 border border-chai-border bg-chai-card rounded-2xl p-6 relative">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                                <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                                <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                            </div>
                            <span className="text-[10px] font-mono text-chai-muted">two-pointers • target 14</span>
                        </div>

                        <div className="flex justify-center gap-2 my-6 font-mono">
                            {[1, 4, 6, 8, 11, 15].map((val, idx) => (
                                <div
                                    key={idx}
                                    className={`w-10 h-12 rounded-lg flex items-center justify-center font-bold text-sm border ${idx === 0 || idx === 5
                                        ? 'border-chai-accent text-chai-accent bg-chai-accent-muted'
                                        : 'border-chai-border text-chai-text'
                                        }`}
                                >
                                    {val}
                                </div>
                            ))}
                        </div>

                        <div className="text-center text-xs font-mono text-chai-muted bg-chai-bg py-2 rounded-lg border border-chai-border">
                            1 + 15 = 16 &gt; 14, move right in
                        </div>
                    </div>
                </div>
            </section>

            {/* Metrics Bar */}
            <div className="border-b border-chai-border grid grid-cols-2 md:grid-cols-4 max-w-7xl mx-auto divide-x divide-chai-border py-6 px-8 text-xs">
                <div>
                    <div className="text-2xl font-bold">184</div>
                    <div className="text-chai-muted">animated problems</div>
                </div>
                <div className="pl-6">
                    <div className="text-2xl font-bold">6</div>
                    <div className="text-chai-muted">visual courses</div>
                </div>
                <div className="pl-6">
                    <div className="text-2xl font-bold">102</div>
                    <div className="text-chai-muted">illustrated chapters</div>
                </div>
                <div className="pl-6">
                    <div className="text-2xl font-bold">39</div>
                    <div className="text-chai-muted">hours of video</div>
                </div>
            </div>

            {/* Problems Table Section */}
            <section className="max-w-7xl mx-auto px-8 py-10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Practice Problems</h2>
                    <div className="flex items-center bg-chai-card border border-chai-border rounded-lg px-3 py-1.5 text-xs w-64">
                        <Search className="w-3.5 h-3.5 text-chai-muted mr-2" />
                        <input
                            type="text"
                            placeholder="Search problems..."
                            className="bg-transparent focus:outline-none w-full text-chai-text placeholder:text-chai-muted"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-chai-muted text-sm py-12 text-center">Loading problems...</div>
                ) : error ? (
                    <div className="text-red-400 text-sm py-12 text-center">Error loading problems.</div>
                ) : problemList.length === 0 ? (
                    <div className="text-chai-muted text-sm py-12 text-center">No problems found.</div>
                ) : (
                    <div className="border border-chai-border rounded-xl overflow-hidden bg-chai-card">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-chai-border bg-chai-bg text-chai-muted font-mono uppercase tracking-wider text-[11px]">
                                    <th className="py-3 px-6">Title</th>
                                    <th className="py-3 px-6">Category</th>
                                    <th className="py-3 px-6">Difficulty</th>
                                    <th className="py-3 px-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-chai-border">
                                {problemList.map((prob: any) => (
                                    <tr key={prob._id || prob.id || prob.slug} className="hover:bg-chai-card-hover transition">
                                        <td className="py-4 px-6 font-medium text-chai-text">{prob.title}</td>
                                        <td className="py-4 px-6 text-chai-muted">{prob.category || 'General'}</td>
                                        <td className="py-4 px-6">
                                            <span
                                                className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${prob.difficulty === 'Easy'
                                                    ? 'border-green-800 text-green-400 bg-green-950/30'
                                                    : prob.difficulty === 'Medium'
                                                        ? 'border-yellow-800 text-yellow-400 bg-yellow-950/30'
                                                        : 'border-red-800 text-red-400 bg-red-950/30'
                                                    }`}
                                            >
                                                {prob.difficulty || 'Easy'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <Link
                                                to={`/problems/${prob.slug}`}
                                                className="inline-flex items-center gap-1 text-chai-accent hover:underline font-medium"
                                            >
                                                Solve <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};