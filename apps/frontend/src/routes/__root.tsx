import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Outlet, createRootRoute,createRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import TestPage from './test-page'; 

const TanStackRouterDevtools =
	process.env.NODE_ENV === "production"
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
			<Outlet />
			<Suspense>
				<TanStackRouterDevtools />
				<ReactQueryDevtools />
			</Suspense>
		</>
	),
});

// * Create a new route for the test page
export const testPageRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/testpage',
    component: TestPage,
});

rootRoute.addChildren([testPageRoute]);

export const Route = rootRoute;