import { Router } from 'express';
import {
  createAnnouncement, getAnnouncements, getAnnouncement,
  updateAnnouncement, deleteAnnouncement,
} from '../controllers/announcementController';
import { authMiddleware } from '../middlewares/auth';
import { roleMiddleware } from '../middlewares/role';

const router = Router();

router.use(authMiddleware);
router.post('/', roleMiddleware('admin'), createAnnouncement);
router.get('/', getAnnouncements);
router.get('/:id', getAnnouncement);
router.put('/:id', roleMiddleware('admin'), updateAnnouncement);
router.delete('/:id', roleMiddleware('admin'), deleteAnnouncement);

export default router;
