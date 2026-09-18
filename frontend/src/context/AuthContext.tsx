import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/axios';

export interface User {
    id: string;
    username: string;
    email: string;
    roles: string[];
}

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Set default authorization header for API calls when access token changes
    useEffect(() => {
        if (accessToken) {
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        } else {
            delete api.defaults.headers.common['Authorization'];
        }
    }, [accessToken]);

    // Silently refresh token on initial page load
    useEffect(() => {
        const initAuth = async () => {
            try {
                const { data } = await api.post('/auth/refresh');
                setAccessToken(data.accessToken);

                const userRes = await api.get('/users/me');
                setUser(userRes.data.user);
            } catch (err) {
                // User not logged in or refresh token expired
                setUser(null);
                setAccessToken(null);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const { data } = await api.post('/auth/login', { email, password });
        setAccessToken(data.accessToken);
        setUser(data.user);
    };

    const register = async (username: string, email: string, password: string) => {
        const { data } = await api.post('/auth/register', { username, email, password });
        setAccessToken(data.accessToken);
        setUser(data.user);
    };

    const logout = async () => {
        try {
            await api.get('/auth/logout');
        } finally {
            setUser(null);
            setAccessToken(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, accessToken, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};