import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import type { Server as HttpServer } from "http";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    {
      name: "nirogcare-api-middleware",
      configureServer(server) {
        if (server.httpServer) {
          server.ssrLoadModule("/src/server/wsChatServer.ts").then((mod) => {
            mod.attachWsChatServer(server.httpServer as HttpServer);
          }).catch((err) => {
            console.error("WS Server Init Error:", err);
          });
        }

        server.middlewares.use(async (req, res, next) => {
          try {
            const { handleApiRequest } = await server.ssrLoadModule("/src/server/apiRouter.ts");
            const handled = await handleApiRequest(req, res);
            if (!handled) {
              next();
            }
          } catch (e) {
            console.error("API Middleware Error:", e);
            next(e);
          }
        });
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
