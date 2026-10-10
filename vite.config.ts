import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import express from 'express';
import dotenv from 'dotenv';
import http, { type Server } from 'http';
import { apiRouter } from './server/api';

dotenv.config();

let apiServer: Server | null = null;

function apiServerPlugin(): Plugin {
  return {
    name: 'api-server-pipe-plugin',
    configureServer(server) {
      if (!apiServer) {
        const app = express();
        app.use(express.json({ limit: '10mb' }));
        app.use('/api', apiRouter);

        apiServer = app.listen(3001, '127.0.0.1', () => {
          console.log('[Onco Agent] Internal Express backend ready on 127.0.0.1:3001');
        });
      }

      // Stream pipe /api requests directly to internal Express server
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith('/api')) {
          return next();
        }

        const proxyReq = http.request(
          {
            hostname: '127.0.0.1',
            port: 3001,
            path: req.url,
            method: req.method,
            headers: req.headers,
          },
          (proxyRes) => {
            res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
            proxyRes.pipe(res);
          }
        );

        proxyReq.on('error', (err) => {
          console.error('[Onco Agent] Proxy pipe error:', err.message);
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        });

        req.pipe(proxyReq);
      });
    },
    closeBundle() {
      if (apiServer) {
        apiServer.close();
        apiServer = null;
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
