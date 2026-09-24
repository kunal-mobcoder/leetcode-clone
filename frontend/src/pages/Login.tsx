import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Lock, Mail } from 'lucide-react';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/problems');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid email or password');
        }
    };

    return (
        <div className="min-h-[calc(100vh-100px)] bg-chai-bg flex items-center justify-center p-6 text-chai-text">
            <div className="w-full max-w-md border border-chai-border bg-chai-card rounded-2xl p-8 shadow-2xl space-y-6">
                <div className="text-center space-y-2">
                    <div className="text-3xl">☕</div>
                    <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
                    <p className="text-xs text-chai-muted">Log in to continue your preparation</p>
                </div>

                {error && (
                    <div className="p-3 bg-red-950/40 border border-red-800 text-red-400 text-xs rounded-lg text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div>
                        <label className="block text-chai-muted font-medium mb-1.5">Email address</label>
                        <div className="flex items-center bg-chai-bg border border-chai-border rounded-lg px-3 py-2.5 focus-within:border-chai-accent transition">
                            <Mail className="w-4 h-4 text-chai-muted mr-2" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="bg-transparent focus:outline-none w-full text-chai-text placeholder:text-chai-muted"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-chai-muted font-medium mb-1.5">Password</label>
                        <div className="flex items-center bg-chai-bg border border-chai-border rounded-lg px-3 py-2.5 focus-within:border-chai-accent transition">
                            <Lock className="w-4 h-4 text-chai-muted mr-2" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="bg-transparent focus:outline-none w-full text-chai-text placeholder:text-chai-muted"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-chai-accent hover:bg-chai-accent-hover text-black font-semibold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition pt-3"
                    >
                        Log In <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </form>

                <p className="text-center text-xs text-chai-muted">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-chai-accent hover:underline font-medium">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};