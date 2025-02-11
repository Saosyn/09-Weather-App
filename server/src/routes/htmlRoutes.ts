import path from 'path';
import { Router, type Request, type Response } from 'express';

// ✅ Explicitly define `__filename` and `__dirname` types
const __filename: string = path.join(process.cwd(), 'src/routes/htmlRoutes.ts');
const __dirname: string = path.dirname(__filename);

const router = Router();

// ✅ Route to serve `index.html`
router.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../../client/dist/index.html'));
});

export default router;
