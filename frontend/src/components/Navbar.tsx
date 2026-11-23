import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, LogOut, User as UserIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <header className="w-full bg-chai-bg border-b border-chai-border text-xs text-chai-text sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-8">
                    <Link to="/problems" className="flex items-center gap-2 font-bold text-base tracking-tight">
                        <Code2 className="w-5 h-5 text-chai-accent" />
                        <span>Leet<span className="text-chai-accent">Clone</span></span>
                    </Link>

                    <nav className="flex items-center gap-6 text-chai-muted font-medium">
                        <Link to="/problems" className="hover:text-chai-text transition">
                            Problems
                        </Link>
                        {user && (
                            <Link to="/profile" className="hover:text-chai-text transition">
                                Profile
                            </Link>
                        )}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link
                                to="/profile"
                                className="flex items-center gap-2 text-chai-muted bg-chai-card hover:bg-chai-card-hover px-3 py-1.5 rounded-lg border border-chai-border transition group"
                                title="View Profile"
                            >
                                <UserIcon className="w-3.5 h-3.5 text-chai-accent group-hover:scale-110 transition-transform" />
                                <span className="text-chai-text font-medium">{user.username}</span>
                                {user.roles?.includes('admin') && (
                                    <span className="bg-amber-950/40 text-amber-400 text-[10px] px-1.5 py-0.2 rounded border border-amber-800 font-semibold uppercase">
                                        Admin
                                    </span>
                                )}
                            </Link>
                            <button
                                onClick={logout}
                                className="flex items-center gap-1.5 text-chai-muted hover:text-red-400 transition font-medium"
                                title="Sign out"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                <span>Logout</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/login" className="text-chai-muted hover:text-chai-text font-medium px-3 py-1.5">
                                Log in
                            </Link>
                            <Link
                                to="/signup"
                                className="bg-chai-accent hover:bg-chai-accent-hover text-black font-semibold px-4 py-1.5 rounded-lg transition"
                            >
                                Sign up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
