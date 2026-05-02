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

// Build-time guard: fail the build if a service-role reference leaks into
// client code. Runs once at buildStart in production.
function serviceRoleGuardPlugin(): Plugin {
  return {
    name: "service-role-guard",
    apply: "build",
    buildStart() {
      try {
        execSync("node --import tsx scripts/check-no-service-role.ts", {
          stdio: "inherit",
          cwd: __dirname,
        });
      } catch (e) {
        throw new Error(
          "Service-role guard failed — refusing to ship a bundle that may leak the service-role key."
        );
      }
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
    serviceRoleGuardPlugin(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  // Strip console/debugger from production bundle. Dev keeps logs.
  esbuild: mode === "production" ? { drop: ["console", "debugger"] } : undefined,
  build: {
    sourcemap: "hidden",
  },
}));
