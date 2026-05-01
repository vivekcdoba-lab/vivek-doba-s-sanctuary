import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { execSync } from "node:child_process";
import { componentTagger } from "lovable-tagger";

// Regenerates Operation Docs on every dev start and production build.
function operationDocsPlugin(): Plugin {
  const run = () => {
    try {
      execSync("node --import tsx scripts/generate-operation-docs.ts", {
        stdio: "inherit",
        cwd: __dirname,
      });
    } catch (e) {
      // Non-fatal: docs regeneration should never break the build.
      console.warn("[operation-docs] generation failed:", (e as Error).message);
    }
  };
  return {
    name: "operation-docs-generator",
    buildStart() {
      run();
    },
    configureServer() {
      run();
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    operationDocsPlugin(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
