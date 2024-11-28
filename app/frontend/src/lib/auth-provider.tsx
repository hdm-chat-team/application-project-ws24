import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from './auth-context';
import api from '@/lib/api';
import type { User } from '@server/db/schema.sql';

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const { data: user, isLoading } = useQuery({
        queryKey: ['auth-user'],
        queryFn: async () => {
            const response = await api.auth.me.$get();
            if (!response.ok) return null;
            return response.json() as Promise<User>;
        },
    });

    if (isLoading) {
        return <div>Laden...</div>;
    }

    return (
        <AuthContext.Provider value={user || null}>
            {children}
        </AuthContext.Provider>
    );
}