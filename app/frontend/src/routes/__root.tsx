import { ThemeProvider } from "@/components/theme-provider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

const TanStackRouterDevtools = import.meta.env.PROD
	? () => null // Render nothing in production
	: lazy(() =>
			// Lazy load in development
			import("@tanstack/router-devtools").then((res) => ({
				default: res.TanStackRouterDevtools,
			})),
		);

export const rootRoute = createRootRoute({
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
});

export const Route = rootRoute;