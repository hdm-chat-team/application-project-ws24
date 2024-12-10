import { QueryClientProvider } from "@/context/query-provider";
import { RouterProvider } from "@/context/router-provider";
import { AuthProvider } from "@/features/auth/context/auth-provider";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./main.css";

// * Mount React application with Router and Query providers
// biome-ignore lint/style/noNonNullAssertion: default
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
	// * Render the app
	const root = ReactDOM.createRoot(rootElement);
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
