import {
	QueryClientProvider as Provider,
	QueryClient,
} from "@tanstack/react-query";
import type { ReactNode } from "react";

// * Initialize React Query client for managing server state
export const queryClient = new QueryClient();

export function QueryClientProvider({ children }: { children: ReactNode }) {
	return <Provider client={queryClient}>{children}</Provider>;
}
