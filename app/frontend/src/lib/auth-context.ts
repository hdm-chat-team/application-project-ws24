import { createContext, useContext } from 'react';
import type { User } from '@server/db/schema.sql';

export const AuthContext = createContext<User | null>(null);

export function useAuthContext() {
    const user = useContext(AuthContext);
    return user;
}