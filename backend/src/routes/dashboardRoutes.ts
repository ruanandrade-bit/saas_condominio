import { Router } from 'express';
import { getAdminDashboard, getResidentDashboard } from '../controllers/dashboardController';
import { authMiddleware } from '../middlewares/auth';
import { roleMiddleware } from '../middlewares/role';

const router = Router();

router.use(authMiddleware);
router.get('/admin', roleMiddleware('admin'), getAdminDashboard);
router.get('/resident', roleMiddleware('resident'), getResidentDashboard);

export default router;
