import { Router } from 'express';
import { createIssue, getIssues, getIssue, updateIssue, updateIssueStatus } from '../controllers/issueController';
import { authMiddleware } from '../middlewares/auth';
import { roleMiddleware } from '../middlewares/role';

const router = Router();

router.use(authMiddleware);
router.post('/', createIssue);
router.get('/', getIssues);
router.get('/:id', getIssue);
router.put('/:id', roleMiddleware('admin'), updateIssue);
router.patch('/:id/status', roleMiddleware('admin'), updateIssueStatus);

export default router;
