import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api/scores": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/api/stats": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/api/predictions": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/api": {
        target: "http://localhost:5068",
        changeOrigin: true,
      },
    },
  },
});
