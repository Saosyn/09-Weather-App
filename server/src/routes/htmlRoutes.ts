import express from 'express';
import path from 'path';
import { Router, type Request, type Response } from 'express';

const router = Router();

router.use(
  '/assets',
  express.static(path.join(process.cwd(), 'client/dist/assets'))
);

router.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'client/dist/index.html'));
});

export default router;
