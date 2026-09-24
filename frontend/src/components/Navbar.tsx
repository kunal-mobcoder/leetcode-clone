import React from 'react';
import { Link } from 'react-router-dom';
import { Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <header className="w-full bg-chai-bg border-b border-chai-border text-xs text-chai-text">
            {/* Top Banner Bar */}
            <div className="flex items-center justify-between px-6 py-2 bg-[#120e0a] border-b border-[#26180c]">
                <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-chai-accent animate-pulse" />
                    <span className="font-semibold text-chai-accent">Learning September</span>
                    <span className="text-chai-muted hidden sm:inline">• Everything is free for everyone until 30 Sept.</span>
                </div>
                <div className="flex items-center gap-3">
                    <button className="bg-chai-accent hover:bg-chai-accent-hover text-black font-semibold px-3 py-1 rounded-md text-xs transition">
                        Start free
                    </button>
                    <span className="text-chai-muted cursor-pointer hover:text-chai-text">not now</span>
                </div>
            </div>

            {/* Main Nav Header */}
            <div className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-2 font-bold text-base tracking-tight">
                        <span className="text-xl">☕</span>
                        <span>Chai <span className="text-chai-accent">Visual</span></span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-6 text-chai-muted font-medium">
                        <Link to="/problems" className="hover:text-chai-text transition">Practice</Link>
                        <a href="#" className="hover:text-chai-text transition">Learn ▾</a>
                        <a href="#" className="hover:text-chai-text transition">Roadmap</a>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <button className="text-chai-muted hover:text-chai-text p-1.5 rounded-lg border border-chai-border">
                        <Sun className="w-4 h-4" />
                    </button>
                    {user ? (
                        <button
                            onClick={logout}
                            className="text-chai-muted hover:text-chai-text font-medium"
                        >
                            Log out
                        </button>
                    ) : (
                        <>
                            <Link to="/login" className="text-chai-muted hover:text-chai-text font-medium">
                                Log in
                            </Link>
                            <Link
                                to="/signup"
                                className="bg-white text-black font-medium px-4 py-1.5 rounded-lg hover:bg-slate-200 transition"
                            >
                                Get started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};