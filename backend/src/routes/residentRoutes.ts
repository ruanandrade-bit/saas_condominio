import { Router } from 'express';
import { createResident, getResidents, getResident, updateResident, deleteResident } from '../controllers/residentController';
import { authMiddleware } from '../middlewares/auth';
import { roleMiddleware } from '../middlewares/role';

const router = Router();

router.use(authMiddleware);
router.post('/', roleMiddleware('admin'), createResident);
router.get('/', roleMiddleware('admin'), getResidents);
router.get('/:id', roleMiddleware('admin'), getResident);
router.put('/:id', roleMiddleware('admin'), updateResident);
router.delete('/:id', roleMiddleware('admin'), deleteResident);

export default router;
