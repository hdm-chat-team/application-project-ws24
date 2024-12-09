import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./main.css";
import { routeTree } from "./routeTree.gen";

// * Initialize React Query client for managing server state
const queryClient = new QueryClient();

// * Configure router with React Query integration
// * - Sets up automatic data loading on route changes
// * - Configures cache behavior for route data
const router = createRouter({
	routeTree,
	defaultNotFoundComponent: () => <div>404 Not Found</div>,
	context: { queryClient },
	defaultPreload: "intent", //	Preload data when user shows intent to navigate
	defaultStaleTime: 0, // 		Always fetch fresh data on route change
});

// * TypeScript type registration for router instance
declare module "@tanstack/react-router" {
	// * Register the router instance for type safety
	interface Register {
		router: typeof router;
	}
}

// * Mount React application with Router and Query providers
// biome-ignore lint/style/noNonNullAssertion: default
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
	// * Render the app
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
			</QueryClientProvider>
		</StrictMode>,
	);
}
