import express from 'express';
import path from 'path';
// import { fileURLToPath } from 'url';
import { Router, type Request, type Response } from 'express';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const router = Router();

// ✅ Serve static files (CSS, JS, images) from `dist/assets/`
router.use(
  '/assets',
  express.static(path.join(process.cwd(), 'client/dist/assets'))
);

// ✅ Serve index.html for all routes
router.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'client/dist/index.html'));
});

export default router;
