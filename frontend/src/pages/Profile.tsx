import React, { useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserProfile } from '../hooks/useUser';
import {
    User as UserIcon,
    Calendar,
    Mail,
    Award,
    CheckCircle2,
    XCircle,
    Clock,
    Target,
    Activity,
    Code2,
    ArrowUpRight,
    Loader2,
} from 'lucide-react';

export const Profile: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const { data: profile, isLoading, error } = useUserProfile();

    // Generate last 16 weeks of calendar days for activity heatmap
    const calendarDays = useMemo(() => {
        const days = [];
        const today = new Date();
        const totalDays = 16 * 7; // 16 weeks

        for (let i = totalDays - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            days.push({
                date: dateStr,
                displayDate: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            });
        }
        return days;
    }, []);

    if (authLoading || isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-60px)] font-mono text-xs text-chai-muted gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-chai-accent" />
                <span>Loading developer profile...</span>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (error || !profile) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 text-center">
                <div className="text-red-400 font-mono text-sm">Failed to load user profile.</div>
                <Link
                    to="/problems"
                    className="text-xs text-chai-accent hover:underline font-medium"
                >
                    Back to Problems
                </Link>
            </div>
        );
    }

    const { stats, recentSubmissions, submissionCalendar } = profile;
    const { solved, totalProblems, acceptanceRate, totalSubmissions, acceptedSubmissions } = stats;

    const overallPct = totalProblems.total > 0
        ? Math.round((solved.total / totalProblems.total) * 100)
        : 0;

    const easyPct = totalProblems.easy > 0
        ? Math.round((solved.easy / totalProblems.easy) * 100)
        : 0;

    const medPct = totalProblems.medium > 0
        ? Math.round((solved.medium / totalProblems.medium) * 100)
        : 0;

    const hardPct = totalProblems.hard > 0
        ? Math.round((solved.hard / totalProblems.hard) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-chai-bg text-chai-text pb-16">
            {/* Profile Header Hero */}
            <div className="border-b border-chai-border bg-chai-card/50">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-chai-accent/20 to-chai-card border border-chai-accent/40 flex items-center justify-center text-chai-accent shadow-inner">
                                <UserIcon className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold tracking-tight">{profile.user.username}</h1>
                                    {profile.user.roles?.includes('admin') && (
                                        <span className="bg-amber-950/50 text-amber-400 border border-amber-800 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full">
                                            Admin
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-xs text-chai-muted">
                                    <span className="flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5" />
                                        {profile.user.email}
                                    </span>
                                    <span className="flex items-center gap-1.5 font-mono">
                                        <Calendar className="w-3.5 h-3.5" />
                                        Joined {new Date(profile.user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                to="/problems"
                                className="bg-chai-accent hover:bg-chai-accent-hover text-black font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
                            >
                                <span>Practice Problems</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 pt-8 space-y-8">
                {/* Metrics Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 1. Solved Problems Progress */}
                    <div className="bg-chai-card border border-chai-border rounded-2xl p-6 flex flex-col justify-between space-y-4">
                        <div className="flex items-center justify-between text-xs text-chai-muted font-mono uppercase tracking-wider">
                            <span className="flex items-center gap-1.5 text-chai-text font-semibold">
                                <Award className="w-4 h-4 text-chai-accent" />
                                Problems Solved
                            </span>
                            <span>{overallPct}%</span>
                        </div>

                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-extrabold text-chai-text tracking-tight font-mono">
                                {solved.total}
                            </span>
                            <span className="text-xs text-chai-muted font-mono">
                                / {totalProblems.total} total
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1.5">
                            <div className="w-full bg-chai-bg h-2 rounded-full overflow-hidden border border-chai-border">
                                <div
                                    className="bg-chai-accent h-full rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, overallPct)}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] text-chai-muted font-mono">
                                <span>All Categories</span>
                                <span>{totalProblems.total - solved.total} remaining</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Difficulty Breakdown */}
                    <div className="bg-chai-card border border-chai-border rounded-2xl p-6 space-y-4">
                        <div className="text-xs text-chai-muted font-mono uppercase tracking-wider flex items-center gap-1.5 text-chai-text font-semibold">
                            <Target className="w-4 h-4 text-chai-accent" />
                            Difficulty Breakdown
                        </div>

                        <div className="space-y-3 text-xs">
                            {/* Easy */}
                            <div className="space-y-1">
                                <div className="flex justify-between items-center text-[11px] font-mono">
                                    <span className="text-green-400 font-semibold">Easy</span>
                                    <span className="text-chai-muted">{solved.easy} / {totalProblems.easy}</span>
                                </div>
                                <div className="w-full bg-chai-bg h-1.5 rounded-full overflow-hidden border border-chai-border">
                                    <div
                                        className="bg-green-500 h-full rounded-full"
                                        style={{ width: `${Math.min(100, easyPct)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Medium */}
                            <div className="space-y-1">
                                <div className="flex justify-between items-center text-[11px] font-mono">
                                    <span className="text-yellow-400 font-semibold">Medium</span>
                                    <span className="text-chai-muted">{solved.medium} / {totalProblems.medium}</span>
                                </div>
                                <div className="w-full bg-chai-bg h-1.5 rounded-full overflow-hidden border border-chai-border">
                                    <div
                                        className="bg-yellow-500 h-full rounded-full"
                                        style={{ width: `${Math.min(100, medPct)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Hard */}
                            <div className="space-y-1">
                                <div className="flex justify-between items-center text-[11px] font-mono">
                                    <span className="text-red-400 font-semibold">Hard</span>
                                    <span className="text-chai-muted">{solved.hard} / {totalProblems.hard}</span>
                                </div>
                                <div className="w-full bg-chai-bg h-1.5 rounded-full overflow-hidden border border-chai-border">
                                    <div
                                        className="bg-red-500 h-full rounded-full"
                                        style={{ width: `${Math.min(100, hardPct)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Acceptance & Submissions Metrics */}
                    <div className="bg-chai-card border border-chai-border rounded-2xl p-6 flex flex-col justify-between space-y-4">
                        <div className="text-xs text-chai-muted font-mono uppercase tracking-wider flex items-center gap-1.5 text-chai-text font-semibold">
                            <Activity className="w-4 h-4 text-chai-accent" />
                            Submission Stats
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-[11px] text-chai-muted block font-mono">Acceptance</span>
                                <span className="text-2xl font-bold font-mono text-green-400">
                                    {acceptanceRate}%
                                </span>
                            </div>

                            <div className="space-y-1">
                                <span className="text-[11px] text-chai-muted block font-mono">Total Submissions</span>
                                <span className="text-2xl font-bold font-mono text-chai-text">
                                    {totalSubmissions}
                                </span>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-chai-border/60 text-[11px] text-chai-muted flex items-center justify-between font-mono">
                            <span>Accepted: <strong className="text-chai-text">{acceptedSubmissions}</strong></span>
                            <span>Rejected: <strong className="text-chai-text">{totalSubmissions - acceptedSubmissions}</strong></span>
                        </div>
                    </div>
                </div>

                {/* Submission Activity Heatmap */}
                <div className="bg-chai-card border border-chai-border rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Code2 className="w-4 h-4 text-chai-accent" />
                            <h2 className="text-sm font-bold tracking-tight">Activity Heatmap</h2>
                            <span className="text-[11px] text-chai-muted font-mono">(Past 16 Weeks)</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-chai-muted font-mono">
                            <span>Less</span>
                            <span className="w-2.5 h-2.5 rounded-xs bg-chai-bg border border-chai-border" />
                            <span className="w-2.5 h-2.5 rounded-xs bg-chai-accent/30" />
                            <span className="w-2.5 h-2.5 rounded-xs bg-chai-accent/60" />
                            <span className="w-2.5 h-2.5 rounded-xs bg-chai-accent" />
                            <span>More</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto pb-2">
                        <div className="grid grid-flow-col grid-rows-7 gap-1.5 w-max">
                            {calendarDays.map((day) => {
                                const count = submissionCalendar[day.date] || 0;
                                const bgClass =
                                    count === 0
                                        ? 'bg-chai-bg border border-chai-border/60'
                                        : count === 1
                                            ? 'bg-chai-accent/30 border border-chai-accent/40'
                                            : count <= 3
                                                ? 'bg-chai-accent/70 border border-chai-accent'
                                                : 'bg-chai-accent border border-white/20';

                                return (
                                    <div
                                        key={day.date}
                                        title={`${count} submissions on ${day.displayDate}`}
                                        className={`w-3.5 h-3.5 rounded-xs transition-colors cursor-pointer ${bgClass}`}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Recent Submissions Feed */}
                <div className="bg-chai-card border border-chai-border rounded-2xl overflow-hidden shadow-sm space-y-0">
                    <div className="p-6 border-b border-chai-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-chai-accent" />
                            <h2 className="text-sm font-bold tracking-tight">Recent Submissions</h2>
                        </div>
                        <span className="text-xs text-chai-muted font-mono">
                            Last {recentSubmissions.length} submissions
                        </span>
                    </div>

                    {!recentSubmissions || recentSubmissions.length === 0 ? (
                        <div className="p-12 text-center text-chai-muted text-xs font-mono">
                            No submissions recorded yet. Head over to the problems list to start solving!
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-chai-border bg-chai-bg text-chai-muted font-mono uppercase text-[10px] tracking-wider">
                                        <th className="py-3 px-6">Status</th>
                                        <th className="py-3 px-6">Problem</th>
                                        <th className="py-3 px-6">Language</th>
                                        <th className="py-3 px-6">Runtime</th>
                                        <th className="py-3 px-6 text-right">Submitted</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-chai-border">
                                    {recentSubmissions.map((sub) => {
                                        const prob = sub.problemId;
                                        if (!prob) return null;

                                        return (
                                            <tr key={sub._id} className="hover:bg-chai-card-hover transition">
                                                <td className="py-3.5 px-6">
                                                    {sub.status === 'accepted' ? (
                                                        <span className="text-green-400 flex items-center gap-1.5 font-bold">
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            <span>Accepted</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-red-400 flex items-center gap-1.5 font-bold">
                                                            <XCircle className="w-4 h-4" />
                                                            <span>{sub.status.replace(/_/g, ' ').toUpperCase()}</span>
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-3.5 px-6 font-medium text-chai-text">
                                                    <Link
                                                        to={`/problems/${prob.slug}`}
                                                        className="hover:text-chai-accent transition flex items-center gap-2"
                                                    >
                                                        <span>{prob.title}</span>
                                                        <span
                                                            className={`px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase border ${
                                                                prob.difficulty === 'easy'
                                                                    ? 'border-green-800 text-green-400 bg-green-950/20'
                                                                    : prob.difficulty === 'medium'
                                                                        ? 'border-yellow-800 text-yellow-400 bg-yellow-950/20'
                                                                        : 'border-red-800 text-red-400 bg-red-950/20'
                                                            }`}
                                                        >
                                                            {prob.difficulty}
                                                        </span>
                                                    </Link>
                                                </td>

                                                <td className="py-3.5 px-6">
                                                    <span className="bg-chai-bg border border-chai-border px-2 py-0.5 rounded text-[10px] font-mono uppercase text-chai-muted">
                                                        {sub.language}
                                                    </span>
                                                </td>

                                                <td className="py-3.5 px-6 font-mono text-chai-muted text-[11px]">
                                                    {sub.runtime !== undefined ? `${Math.round(sub.runtime)} ms` : '-'}
                                                </td>

                                                <td className="py-3.5 px-6 text-right font-mono text-chai-muted text-[11px]">
                                                    {new Date(sub.createdAt).toLocaleDateString(undefined, {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
