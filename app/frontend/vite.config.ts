import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
	plugins: [
		react(),
		TanStackRouterVite(),
		visualizer({
			emitFile: true,
		}),
		VitePWA({
			workbox: {
				navigateFallbackDenylist: [/^\/api/],
				maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // ? 3MB
			},
			registerType: "autoUpdate",
			devOptions: {
				enabled: false, // ? set true to enable PWA in development
			},
			includeAssets: ["favicon.ico", "apple-touch-icon.png"],
			manifest: {
				name: "StudyConnect",
				short_name: "SC",
				description: "The best way to connect at HdM",
				theme_color: "#B6001F",
				icons: [
					{
						src: "pwa-64x64.png",
						sizes: "64x64",
						type: "image/png",
					},
					{
						src: "pwa-192x192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
					},
					{
						src: "pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any",
					},
					{
						src: "maskable-icon-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable",
					},
				],
			},
		}),
	],
	optimizeDeps: {
		exclude: ["@jsquash/avif"],
	},
	resolve: {
		alias: {
			"@": `${__dirname}/src`,
			"@assets": `${__dirname}/assets/`,
			"@server": `${__dirname}/../backend/`,
			"@shared": `${__dirname}/../shared/`,
		},
	},
	build: {
		outDir: "../dist/client",
		emptyOutDir: true,
		rollupOptions: {
			output: {
				manualChunks: {
					zod: ["zod"],
					vendor: ["react", "react-dom"],
				},
			},
		},
	},
	esbuild: {
		drop: mode === "production" ? ["console", "debugger"] : [],
	},
	server: {
		proxy: {
			"/api": {
				target: "http://localhost:3000",
				changeOrigin: true,
			},
		},
	},
	worker: { format: "es" },
}));
