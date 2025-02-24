import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Router, type Request, type Response } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// ✅ Serve static files (CSS, JS, images) from client/
router.use(express.static(path.join(__dirname, '../../client')));

// ✅ Serve index.html for all routes
router.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../client/index.html'));
});

export default router;
