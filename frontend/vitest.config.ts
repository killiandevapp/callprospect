import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,                 // ✅ AJOUTE ÇA
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
