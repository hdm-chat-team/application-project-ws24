import { QueryClientProvider, RouterProvider } from "@/context";
import { AuthProvider } from "@/features/auth";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./main.css";

// * Mount React application with Router and Query providers
// biome-ignore lint/style/noNonNullAssertion: default
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
	// * Render the app
	const root = createRoot(rootElement);
	root.render(
		<StrictMode>
			<QueryClientProvider>
				<AuthProvider>
					<RouterProvider />
				</AuthProvider>
			</QueryClientProvider>
		</StrictMode>,
	);
}
