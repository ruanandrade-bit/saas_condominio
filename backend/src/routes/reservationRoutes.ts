import { Router } from 'express';
import {
  createReservation, getReservations, getReservation,
  approveReservation, rejectReservation, cancelReservation,
} from '../controllers/reservationController';
import { authMiddleware } from '../middlewares/auth';
import { roleMiddleware } from '../middlewares/role';

const router = Router();

router.use(authMiddleware);
router.post('/', createReservation);
router.get('/', getReservations);
router.get('/:id', getReservation);
router.patch('/:id/approve', roleMiddleware('admin'), approveReservation);
router.patch('/:id/reject', roleMiddleware('admin'), rejectReservation);
router.patch('/:id/cancel', cancelReservation);

export default router;
