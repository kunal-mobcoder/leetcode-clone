import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminProblems, useUpdateProblemStatus } from '../../hooks/useAdmin';
import {
    Plus,
    Search,
    Edit,
    FlaskConical,
    ExternalLink,
    CheckCircle,
    Archive,
    RotateCcw,
    FileCode,
    Sparkles,
} from 'lucide-react';

export const AdminProblemList: React.FC = () => {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [search, setSearch] = useState<string>('');

    const { data: problems = [], isLoading, error } = useAdminProblems(statusFilter, search);
    const statusMutation = useUpdateProblemStatus();

    const totalCount = problems.length;
    const publishedCount = problems.filter((p) => p.status === 'published').length;
    const draftCount = problems.filter((p) => p.status === 'draft').length;
    const archivedCount = problems.filter((p) => p.status === 'archived').length;

    const handleStatusChange = async (id: string, newStatus: 'draft' | 'published' | 'archived') => {
        try {
            await statusMutation.mutateAsync({ id, status: newStatus });
        } catch (err) {
            console.error('Failed to change problem status:', err);
        }
    };

    return (
        <div className="min-h-screen bg-chai-bg text-chai-text pb-16">
            {/* Header Hero */}
            <div className="border-b border-chai-border bg-chai-card/40">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-chai-accent text-xs font-semibold uppercase tracking-wider font-mono">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Administration</span>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight">Problem Management</h1>
                            <p className="text-xs text-chai-muted">
                                Create, review, publish, and manage test cases for all coding problems.
                            </p>
                        </div>

                        <Link
                            to="/admin/problems/new"
                            className="bg-chai-accent hover:bg-chai-accent-hover text-black font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition w-fit shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Create New Problem</span>
                        </Link>
                    </div>

                    {/* Stats Ribbon */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                        <div className="bg-chai-bg border border-chai-border rounded-xl p-3 text-xs">
                            <span className="text-chai-muted block text-[10px] uppercase font-mono">Total Problems</span>
                            <span className="text-lg font-bold font-mono text-chai-text">{totalCount}</span>
                        </div>
                        <div className="bg-chai-bg border border-chai-border rounded-xl p-3 text-xs">
                            <span className="text-green-400/80 block text-[10px] uppercase font-mono">Published</span>
                            <span className="text-lg font-bold font-mono text-green-400">{publishedCount}</span>
                        </div>
                        <div className="bg-chai-bg border border-chai-border rounded-xl p-3 text-xs">
                            <span className="text-yellow-400/80 block text-[10px] uppercase font-mono">Drafts</span>
                            <span className="text-lg font-bold font-mono text-yellow-400">{draftCount}</span>
                        </div>
                        <div className="bg-chai-bg border border-chai-border rounded-xl p-3 text-xs">
                            <span className="text-chai-muted block text-[10px] uppercase font-mono">Archived</span>
                            <span className="text-lg font-bold font-mono text-chai-muted">{archivedCount}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-1.5 bg-chai-card border border-chai-border p-1 rounded-lg text-xs font-medium">
                        {(['all', 'published', 'draft', 'archived'] as const).map((st) => (
                            <button
                                key={st}
                                onClick={() => setStatusFilter(st)}
                                className={`px-3 py-1 rounded-md capitalize transition ${
                                    statusFilter === st
                                        ? 'bg-chai-accent text-black font-semibold'
                                        : 'text-chai-muted hover:text-chai-text'
                                }`}
                            >
                                {st}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center bg-chai-card border border-chai-border rounded-lg px-3 py-1.5 text-xs w-full sm:w-72">
                        <Search className="w-3.5 h-3.5 text-chai-muted mr-2 flex-shrink-0" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Filter by title or tag..."
                            className="bg-transparent focus:outline-none w-full text-chai-text placeholder:text-chai-muted text-xs"
                        />
                    </div>
                </div>

                {/* Table */}
                {isLoading ? (
                    <div className="text-chai-muted text-xs py-16 text-center font-mono">
                        Loading admin problem directory...
                    </div>
                ) : error ? (
                    <div className="text-red-400 text-xs py-16 text-center font-mono">
                        Failed to load problems. Please make sure you are logged in with admin privileges.
                    </div>
                ) : problems.length === 0 ? (
                    <div className="text-chai-muted text-xs py-16 text-center border border-dashed border-chai-border rounded-2xl p-8 space-y-3">
                        <FileCode className="w-8 h-8 mx-auto text-chai-muted/50" />
                        <div>No problems found matching the selected filter.</div>
                        <Link
                            to="/admin/problems/new"
                            className="inline-flex items-center gap-1.5 text-chai-accent hover:underline font-medium text-xs"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Create one now</span>
                        </Link>
                    </div>
                ) : (
                    <div className="border border-chai-border rounded-2xl overflow-hidden bg-chai-card shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-chai-border bg-chai-bg text-chai-muted font-mono uppercase text-[10px] tracking-wider">
                                        <th className="py-3.5 px-6">Problem</th>
                                        <th className="py-3.5 px-4">Difficulty</th>
                                        <th className="py-3.5 px-4">Status</th>
                                        <th className="py-3.5 px-4">Tags</th>
                                        <th className="py-3.5 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-chai-border">
                                    {problems.map((prob) => (
                                        <tr key={prob._id} className="hover:bg-chai-card-hover transition">
                                            {/* Problem Title & Slug */}
                                            <td className="py-4 px-6 font-medium text-chai-text">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-sm">{prob.title}</span>
                                                        <Link
                                                            to={`/problems/${prob.slug}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-chai-muted hover:text-chai-accent transition p-0.5"
                                                            title="Preview problem in workspace"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </Link>
                                                    </div>
                                                    <span className="text-[11px] font-mono text-chai-muted block">
                                                        /{prob.slug}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Difficulty */}
                                            <td className="py-4 px-4">
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${
                                                        prob.difficulty === 'easy'
                                                            ? 'border-green-800 text-green-400 bg-green-950/20'
                                                            : prob.difficulty === 'medium'
                                                                ? 'border-yellow-800 text-yellow-400 bg-yellow-950/20'
                                                                : 'border-red-800 text-red-400 bg-red-950/20'
                                                    }`}
                                                >
                                                    {prob.difficulty}
                                                </span>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="py-4 px-4">
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border ${
                                                        prob.status === 'published'
                                                            ? 'border-green-800/80 text-green-400 bg-green-950/30'
                                                            : prob.status === 'draft'
                                                                ? 'border-yellow-800/80 text-yellow-400 bg-yellow-950/30'
                                                                : 'border-chai-border text-chai-muted bg-chai-bg'
                                                    }`}
                                                >
                                                    {prob.status}
                                                </span>
                                            </td>

                                            {/* Tags */}
                                            <td className="py-4 px-4">
                                                <div className="flex flex-wrap gap-1 max-w-xs">
                                                    {prob.tags && prob.tags.length > 0 ? (
                                                        prob.tags.map((tag: string) => (
                                                            <span
                                                                key={tag}
                                                                className="bg-chai-bg text-chai-muted px-1.5 py-0.2 rounded text-[10px] font-mono border border-chai-border"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-chai-muted/60 text-[11px]">-</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* Quick Status Toggle */}
                                                    {prob.status === 'draft' && (
                                                        <button
                                                            onClick={() => handleStatusChange(prob._id, 'published')}
                                                            disabled={statusMutation.isPending}
                                                            className="text-green-400 hover:text-green-300 bg-green-950/30 border border-green-800/80 px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition"
                                                            title="Publish problem to make it visible to all users"
                                                        >
                                                            <CheckCircle className="w-3 h-3" />
                                                            <span>Publish</span>
                                                        </button>
                                                    )}

                                                    {prob.status === 'published' && (
                                                        <button
                                                            onClick={() => handleStatusChange(prob._id, 'draft')}
                                                            disabled={statusMutation.isPending}
                                                            className="text-yellow-400 hover:text-yellow-300 bg-yellow-950/30 border border-yellow-800/80 px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition"
                                                            title="Unpublish problem to draft mode"
                                                        >
                                                            <span>Unpublish</span>
                                                        </button>
                                                    )}

                                                    {prob.status === 'archived' && (
                                                        <button
                                                            onClick={() => handleStatusChange(prob._id, 'draft')}
                                                            disabled={statusMutation.isPending}
                                                            className="text-chai-muted hover:text-chai-text bg-chai-bg border border-chai-border px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition"
                                                            title="Restore problem to draft mode"
                                                        >
                                                            <RotateCcw className="w-3 h-3" />
                                                            <span>Restore</span>
                                                        </button>
                                                    )}

                                                    {/* Manage Test Cases Button */}
                                                    <Link
                                                        to={`/admin/problems/${prob._id}/test-cases`}
                                                        className="bg-chai-bg hover:bg-chai-card-hover border border-chai-border text-chai-text px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition"
                                                        title="Manage public and secret test cases"
                                                    >
                                                        <FlaskConical className="w-3 h-3 text-chai-accent" />
                                                        <span>Test Cases</span>
                                                    </Link>

                                                    {/* Edit Problem Details */}
                                                    <Link
                                                        to={`/admin/problems/${prob._id}/edit`}
                                                        className="bg-chai-bg hover:bg-chai-card-hover border border-chai-border text-chai-text px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition"
                                                        title="Edit problem description, starter code, and constraints"
                                                    >
                                                        <Edit className="w-3 h-3 text-chai-muted" />
                                                        <span>Edit</span>
                                                    </Link>

                                                    {/* Archive Button */}
                                                    {prob.status !== 'archived' && (
                                                        <button
                                                            onClick={() => handleStatusChange(prob._id, 'archived')}
                                                            disabled={statusMutation.isPending}
                                                            className="text-chai-muted hover:text-red-400 p-1.5 rounded-lg border border-transparent hover:border-red-950 transition"
                                                            title="Archive problem"
                                                        >
                                                            <Archive className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
