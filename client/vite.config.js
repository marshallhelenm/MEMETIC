import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const wsUrl = process.env.VITE_WS_URL || env.VITE_WS_URL || "";

  return {
    define: {
      __VITE_WS_URL__: JSON.stringify(wsUrl),
    },
    resolve: {
      alias: {
        crypto: "crypto-browserify",
      },
      extensions: [".js", ".jsx", ".ts", ".tsx"],
    },
    plugins: [react(), eslint()],
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              return id
                .toString()
                .split("node_modules/")[1]
                .split("/")[0]
                .toString();
            }
          },
        },
      },
    },
  };
});
