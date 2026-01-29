import path from 'path';
import { defineConfig, loadEnv, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import purgecss from 'vite-plugin-purgecss';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  const plugins: PluginOption[] = [
    react(),
    tailwindcss(),
    (purgecss as unknown as (options: unknown) => PluginOption)({
      content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
      safelist: {
        standard: [/^leaflet-/, 'dark'],
        deep: [/^leaflet-/],
      },
    }),
  ];

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8080',
          changeOrigin: true,
          rewrite: (path) => path,
        },
      },
    },
    plugins,
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-utils': ['lucide-react', 'framer-motion'],
            'vendor-charts': ['recharts'],
            'vendor-maps': ['leaflet'],
          },
        },
      },
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
