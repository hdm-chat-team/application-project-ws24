import DefaultNotFound from "@/components/default-not-found";
import { queryClient } from "@/context/query-provider";
import { routeTree } from "@/routeTree.gen";
import {
	RouterProvider as Provider,
	createRouter,
} from "@tanstack/react-router";

/**
 * The router instance:
 * - loads the route tree generated by the `routeTree.gen.ts` file
 * - sets a default not found component for missing routes
 * - sets the queryClient as context for loading data
 */
const router = createRouter({
	routeTree,
	defaultNotFoundComponent: DefaultNotFound,
	context: { queryClient },
	defaultPreloadStaleTime: 0, // * Because we are using ReactQuery's caching
});

// * TypeScript type registration for router instance
declare module "@tanstack/react-router" {
	// Register the router instance for type safety
	interface Register {
		router: typeof router;
	}
}

export function RouterProvider() {
	return <Provider router={router} />;
}
