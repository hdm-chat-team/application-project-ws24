import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), TanStackRouterVite()],
	server: {
		proxy: {
			"/api": "http://localhost:3000",
		},
	},
	resolve: {
		alias: {
			"@": `${__dirname}/src`,
		},
	},
});
