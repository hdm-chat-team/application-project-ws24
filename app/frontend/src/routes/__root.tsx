import { ThemeProvider } from "@/context";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

const TanStackRouterDevtools = import.meta.env.PROD
	? () => null // Render nothing in production
	: lazy(() =>
			// Lazy load in development
			import("@tanstack/router-devtools").then((res) => ({
				default: res.TanStackRouterDevtools,
			})),
		);

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
	{
		// TODO: Wrap all routes in root layout
		component: () => (
			<>
				<ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
					<Outlet />
				</ThemeProvider>
				<Suspense>
					<TanStackRouterDevtools />
					<ReactQueryDevtools />
				</Suspense>
			</>
		),
	},
);
