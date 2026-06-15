import { Router } from 'express';
import { createCondominium, getMyCondominium, updateCondominium } from '../controllers/condominiumController';
import { authMiddleware } from '../middlewares/auth';
import { roleMiddleware } from '../middlewares/role';

const router = Router();

router.use(authMiddleware);
router.post('/', roleMiddleware('admin'), createCondominium);
router.get('/my', getMyCondominium);
router.put('/:id', roleMiddleware('admin'), updateCondominium);

export default router;
