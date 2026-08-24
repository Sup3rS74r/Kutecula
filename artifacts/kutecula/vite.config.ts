import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// Optional: only import Replit plugins when running inside Replit
const isReplit = process.env.REPL_ID !== undefined;

export default defineConfig(async (): Promise<any> => {
  const plugins: any[] = [react(), tailwindcss()];

  if (isReplit) {
    // Replit-specific dev tools — only loaded in that environment
    try {
      // @ts-ignore
      const runtimeErrorOverlay = await import('@replit/vite-plugin-runtime-error-modal');
      plugins.push(runtimeErrorOverlay.default());

      if (process.env.NODE_ENV !== 'production') {
        // @ts-ignore
        const cartographer = await import('@replit/vite-plugin-cartographer');
        plugins.push(cartographer.cartographer({ root: path.resolve(import.meta.dirname, '..') }));
        // @ts-ignore
        const devBanner = await import('@replit/vite-plugin-dev-banner');
        plugins.push(devBanner.devBanner());
      }
    } catch {
      // Replit plugins not available — safe to ignore
    }
  }

  return {
    base: '/',
    plugins,
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, 'src'),
        '@assets': path.resolve(import.meta.dirname, '..', '..', 'attached_assets'),
      },
      dedupe: ['react', 'react-dom'],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, 'dist'),
      emptyOutDir: true,
    },
    server: {
      port: Number(process.env.PORT) || 3000,
      host: '0.0.0.0',
      allowedHosts: true,
    },
    preview: {
      port: Number(process.env.PORT) || 3000,
      host: '0.0.0.0',
      allowedHosts: true,
    },
  };
});
