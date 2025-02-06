import { Router } from 'express';
const router = Router();

import weatherRoutes from './weatherRoutes.js';
import htmlRoutes from '../htmlRoutes.js';

router.use('/weather', weatherRoutes);
router.use('/', htmlRoutes);

export default router;
