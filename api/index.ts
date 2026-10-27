// Vercel Serverless Function Entry Point
// This file exports the Express app for Vercel to invoke per-request.
// It must NOT call app.listen() — Vercel handles the HTTP lifecycle.
import { app, initializeApp } from '../server.js';

let initialization: Promise<void> | undefined;

export default async function handler(req: any, res: any) {
  initialization ??= initializeApp();

  try {
    await initialization;
  } catch (error) {
    initialization = undefined;
    console.error('[StaffSync API] Database initialization failed:', error);
    if (!res.headersSent) {
      res.status(503).json({ error: 'The service is temporarily unavailable. Database initialization failed.' });
    }
    return;
  }

  return app(req, res);
}
