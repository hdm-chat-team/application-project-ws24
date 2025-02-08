import { QueryClientProvider, RouterProvider, ThemeProvider } from "@/context";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./main.css";
import { ChatProvider } from "./features/chat/context";

// * Mount React application with Router and Query providers
// biome-ignore lint/style/noNonNullAssertion: default
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
	// * Render the app
	const root = createRoot(rootElement);
	root.render(
		<StrictMode>
			<QueryClientProvider>
				<ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
					<ChatProvider>
						<RouterProvider />
					</ChatProvider>
				</ThemeProvider>
			</QueryClientProvider>
		</StrictMode>,
	);
}
