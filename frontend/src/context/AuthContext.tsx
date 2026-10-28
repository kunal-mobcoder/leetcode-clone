import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setAccessToken } from '../api/axios';

export interface User {
    id: string;
    username: string;
    email: string;
    roles: string[];
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (username: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await api.post('/auth/refresh');
                if (res.data?.accessToken) {
                    setAccessToken(res.data.accessToken);
                }
                if (res.data?.user) {
                    setUser(res.data.user);
                }
            } catch {
                // Guest user or no active session — clean fallback
                setAccessToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const res = await api.post('/auth/login', { email, password });
        if (res.data?.accessToken) {
            setAccessToken(res.data.accessToken);
        }
        if (res.data?.user) {
            setUser(res.data.user);
        }
    };

    const signup = async (username: string, email: string, password: string) => {
        const res = await api.post('/auth/register', { username, email, password });
        if (res.data?.accessToken) {
            setAccessToken(res.data.accessToken);
        }
        if (res.data?.user) {
            setUser(res.data.user);
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setAccessToken(null);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
