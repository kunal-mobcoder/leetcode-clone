import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, LogOut, User as UserIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
            <Link to="/problems" className="flex items-center gap-2.5 group">
                <div className="p-1.5 bg-blue-600/10 border border-blue-500/20 rounded-lg group-hover:border-blue-500/40 transition-colors">
                    <Code2 className="w-5 h-5 text-blue-400" />
                </div>
                <span className="font-bold text-slate-100 tracking-tight text-lg">
                    Code<span className="text-blue-500">Arena</span>
                </span>
            </Link>

            <div className="flex items-center gap-4">
                {user ? (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-sm text-slate-300">
                            <UserIcon className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-200">{user.username}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Link
                            to="/login"
                            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                        >
                            Sign In
                        </Link>
                        <Link
                            to="/signup"
                            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-600/20"
                        >
                            Sign Up
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
};