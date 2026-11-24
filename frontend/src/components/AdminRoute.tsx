import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const AdminRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-60px)] font-mono text-xs text-chai-muted gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-chai-accent" />
                <span>Checking admin authorization...</span>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!user.roles?.includes('admin')) {
        return <Navigate to="/problems" replace />;
    }

    return children ? <>{children}</> : <Outlet />;
};
