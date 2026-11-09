import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
  const enableHmr = process.env.ENABLE_HMR === 'true';
  return {
    plugins: [
      react({
        // Vite 8 + @vitejs/plugin-react v6 + Express middleware mode can inject
        // React Refresh preamble/runtime in a way that fails in this environment
        // and produces a blank page. Default stable: disable refresh transforms.
        // Set ENABLE_HMR=true only after verifying the preamble/websocket path.
        refreshExclude: enableHmr ? undefined : [/\.[cm]?[jt]sx?$/],
      }),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: enableHmr ? undefined : false,
      watch: {},
    },
  };
});
