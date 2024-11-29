// vite.config.ts
import { TanStackRouterVite } from "file:///C:/Users/ARSLABI/application-project-ws24/node_modules/@tanstack/router-plugin/dist/esm/vite.js";
import react from "file:///C:/Users/ARSLABI/application-project-ws24/node_modules/@vitejs/plugin-react-swc/index.mjs";
import { visualizer } from "file:///C:/Users/ARSLABI/application-project-ws24/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import { defineConfig } from "file:///C:/Users/ARSLABI/application-project-ws24/node_modules/vite/dist/node/index.js";
import { VitePWA } from "file:///C:/Users/ARSLABI/application-project-ws24/node_modules/vite-plugin-pwa/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\ARSLABI\\application-project-ws24\\app\\frontend";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    TanStackRouterVite(),
    visualizer({
      emitFile: true
    }),
    VitePWA({
      workbox: {
        navigateFallbackDenylist: [/^\/api/]
      },
      registerType: "autoUpdate",
      devOptions: {
        enabled: true
      },
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "StudyConnect",
        short_name: "SC",
        description: "The best way to connect at HdM",
        // TODO: Set App Color
        theme_color: "#ffffff",
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png"
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      "@": `${__vite_injected_original_dirname}/src`,
      "@server": `${__vite_injected_original_dirname}/../backend/`
    }
  },
  build: {
    outDir: "../dist/client",
    emptyOutDir: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBUlNMQUJJXFxcXGFwcGxpY2F0aW9uLXByb2plY3Qtd3MyNFxcXFxhcHBcXFxcZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEFSU0xBQklcXFxcYXBwbGljYXRpb24tcHJvamVjdC13czI0XFxcXGFwcFxcXFxmcm9udGVuZFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvQVJTTEFCSS9hcHBsaWNhdGlvbi1wcm9qZWN0LXdzMjQvYXBwL2Zyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgVGFuU3RhY2tSb3V0ZXJWaXRlIH0gZnJvbSBcIkB0YW5zdGFjay9yb3V0ZXItcGx1Z2luL3ZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHsgdmlzdWFsaXplciB9IGZyb20gXCJyb2xsdXAtcGx1Z2luLXZpc3VhbGl6ZXJcIjtcclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gXCJ2aXRlLXBsdWdpbi1wd2FcIjtcclxuXHJcbi8vIGh0dHBzOi8vdml0ZS5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG5cdHBsdWdpbnM6IFtcclxuXHRcdHJlYWN0KCksXHJcblx0XHRUYW5TdGFja1JvdXRlclZpdGUoKSxcclxuXHRcdHZpc3VhbGl6ZXIoe1xyXG5cdFx0XHRlbWl0RmlsZTogdHJ1ZSxcclxuXHRcdH0pLFxyXG5cdFx0Vml0ZVBXQSh7XHJcblx0XHRcdHdvcmtib3g6IHtcclxuXHRcdFx0XHRuYXZpZ2F0ZUZhbGxiYWNrRGVueWxpc3Q6IFsvXlxcL2FwaS9dLFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRyZWdpc3RlclR5cGU6IFwiYXV0b1VwZGF0ZVwiLFxyXG5cdFx0XHRkZXZPcHRpb25zOiB7XHJcblx0XHRcdFx0ZW5hYmxlZDogdHJ1ZSxcclxuXHRcdFx0fSxcclxuXHRcdFx0aW5jbHVkZUFzc2V0czogW1wiZmF2aWNvbi5pY29cIiwgXCJhcHBsZS10b3VjaC1pY29uLnBuZ1wiXSxcclxuXHRcdFx0bWFuaWZlc3Q6IHtcclxuXHRcdFx0XHRuYW1lOiBcIlN0dWR5Q29ubmVjdFwiLFxyXG5cdFx0XHRcdHNob3J0X25hbWU6IFwiU0NcIixcclxuXHRcdFx0XHRkZXNjcmlwdGlvbjogXCJUaGUgYmVzdCB3YXkgdG8gY29ubmVjdCBhdCBIZE1cIixcclxuXHRcdFx0XHQvLyBUT0RPOiBTZXQgQXBwIENvbG9yXHJcblx0XHRcdFx0dGhlbWVfY29sb3I6IFwiI2ZmZmZmZlwiLFxyXG5cdFx0XHRcdGljb25zOiBbXHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdHNyYzogXCJwd2EtNjR4NjQucG5nXCIsXHJcblx0XHRcdFx0XHRcdHNpemVzOiBcIjY0eDY0XCIsXHJcblx0XHRcdFx0XHRcdHR5cGU6IFwiaW1hZ2UvcG5nXCIsXHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRzcmM6IFwicHdhLTE5MngxOTIucG5nXCIsXHJcblx0XHRcdFx0XHRcdHNpemVzOiBcIjE5MngxOTJcIixcclxuXHRcdFx0XHRcdFx0dHlwZTogXCJpbWFnZS9wbmdcIixcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdHNyYzogXCJwd2EtNTEyeDUxMi5wbmdcIixcclxuXHRcdFx0XHRcdFx0c2l6ZXM6IFwiNTEyeDUxMlwiLFxyXG5cdFx0XHRcdFx0XHR0eXBlOiBcImltYWdlL3BuZ1wiLFxyXG5cdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0c3JjOiBcInB3YS01MTJ4NTEyLnBuZ1wiLFxyXG5cdFx0XHRcdFx0XHRzaXplczogXCI1MTJ4NTEyXCIsXHJcblx0XHRcdFx0XHRcdHR5cGU6IFwiaW1hZ2UvcG5nXCIsXHJcblx0XHRcdFx0XHRcdHB1cnBvc2U6IFwiYW55XCIsXHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRzcmM6IFwibWFza2FibGUtaWNvbi01MTJ4NTEyLnBuZ1wiLFxyXG5cdFx0XHRcdFx0XHRzaXplczogXCI1MTJ4NTEyXCIsXHJcblx0XHRcdFx0XHRcdHR5cGU6IFwiaW1hZ2UvcG5nXCIsXHJcblx0XHRcdFx0XHRcdHB1cnBvc2U6IFwibWFza2FibGVcIixcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XSxcclxuXHRcdFx0fSxcclxuXHRcdH0pLFxyXG5cdF0sXHJcblx0c2VydmVyOiB7XHJcblx0XHRwcm94eToge1xyXG5cdFx0XHRcIi9hcGlcIjoge1xyXG5cdFx0XHRcdHRhcmdldDogXCJodHRwOi8vbG9jYWxob3N0OjMwMDBcIixcclxuXHRcdFx0XHRjaGFuZ2VPcmlnaW46IHRydWUsXHJcblx0XHRcdH0sXHJcblx0XHR9LFxyXG5cdH0sXHJcblx0cmVzb2x2ZToge1xyXG5cdFx0YWxpYXM6IHtcclxuXHRcdFx0XCJAXCI6IGAke19fZGlybmFtZX0vc3JjYCxcclxuXHRcdFx0XCJAc2VydmVyXCI6IGAke19fZGlybmFtZX0vLi4vYmFja2VuZC9gLFxyXG5cdFx0fSxcclxuXHR9LFxyXG5cdGJ1aWxkOiB7XHJcblx0XHRvdXREaXI6IFwiLi4vZGlzdC9jbGllbnRcIixcclxuXHRcdGVtcHR5T3V0RGlyOiB0cnVlLFxyXG5cdH0sXHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWdXLFNBQVMsMEJBQTBCO0FBQ25ZLE9BQU8sV0FBVztBQUNsQixTQUFTLGtCQUFrQjtBQUMzQixTQUFTLG9CQUFvQjtBQUM3QixTQUFTLGVBQWU7QUFKeEIsSUFBTSxtQ0FBbUM7QUFPekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDM0IsU0FBUztBQUFBLElBQ1IsTUFBTTtBQUFBLElBQ04sbUJBQW1CO0FBQUEsSUFDbkIsV0FBVztBQUFBLE1BQ1YsVUFBVTtBQUFBLElBQ1gsQ0FBQztBQUFBLElBQ0QsUUFBUTtBQUFBLE1BQ1AsU0FBUztBQUFBLFFBQ1IsMEJBQTBCLENBQUMsUUFBUTtBQUFBLE1BQ3BDO0FBQUEsTUFDQSxjQUFjO0FBQUEsTUFDZCxZQUFZO0FBQUEsUUFDWCxTQUFTO0FBQUEsTUFDVjtBQUFBLE1BQ0EsZUFBZSxDQUFDLGVBQWUsc0JBQXNCO0FBQUEsTUFDckQsVUFBVTtBQUFBLFFBQ1QsTUFBTTtBQUFBLFFBQ04sWUFBWTtBQUFBLFFBQ1osYUFBYTtBQUFBO0FBQUEsUUFFYixhQUFhO0FBQUEsUUFDYixPQUFPO0FBQUEsVUFDTjtBQUFBLFlBQ0MsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFVBQ1A7QUFBQSxVQUNBO0FBQUEsWUFDQyxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDUDtBQUFBLFVBQ0E7QUFBQSxZQUNDLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNQO0FBQUEsVUFDQTtBQUFBLFlBQ0MsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFlBQ04sU0FBUztBQUFBLFVBQ1Y7QUFBQSxVQUNBO0FBQUEsWUFDQyxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixTQUFTO0FBQUEsVUFDVjtBQUFBLFFBQ0Q7QUFBQSxNQUNEO0FBQUEsSUFDRCxDQUFDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ04sUUFBUTtBQUFBLFFBQ1AsUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLE1BQ2Y7QUFBQSxJQUNEO0FBQUEsRUFDRDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1IsT0FBTztBQUFBLE1BQ04sS0FBSyxHQUFHLGdDQUFTO0FBQUEsTUFDakIsV0FBVyxHQUFHLGdDQUFTO0FBQUEsSUFDeEI7QUFBQSxFQUNEO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTixRQUFRO0FBQUEsSUFDUixhQUFhO0FBQUEsRUFDZDtBQUNELENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
