import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  define: {
    "process.env": {},
  },

  build: {
    target: "es2022",
    rollupOptions: {
      output: {
        manualChunks: { vendor: ["react", "react-dom", "react-router-dom"] },
      },
    },
  },
});
