import { Router } from 'express';
import {
  createCharge, createBulkCharges, getCharges, getCharge,
  updateCharge, markAsPaid, markAsPending, deleteCharge,
} from '../controllers/chargeController';
import { authMiddleware } from '../middlewares/auth';
import { roleMiddleware } from '../middlewares/role';

const router = Router();

router.use(authMiddleware);
router.post('/', roleMiddleware('admin'), createCharge);
router.post('/bulk', roleMiddleware('admin'), createBulkCharges);
router.get('/', getCharges);
router.get('/:id', getCharge);
router.put('/:id', roleMiddleware('admin'), updateCharge);
router.patch('/:id/mark-paid', roleMiddleware('admin'), markAsPaid);
router.patch('/:id/mark-pending', roleMiddleware('admin'), markAsPending);
router.delete('/:id', roleMiddleware('admin'), deleteCharge);

export default router;
