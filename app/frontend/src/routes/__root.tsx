import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import { Toaster } from "sonner";

const TanStackRouterDevtools = import.meta.env.PROD
	? () => null // Render nothing in production
	: lazy(() =>
			// Lazy load in development
			import("@tanstack/router-devtools").then((res) => ({
				default: res.TanStackRouterDevtools,
			})),
		);

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	component: () => (
		<>
			<Outlet />
			<Toaster closeButton richColors />
			{/* Devtools */}
			<Suspense>
				<TanStackRouterDevtools />
				<ReactQueryDevtools />
			</Suspense>
		</>
	),
});
