import { Router } from 'express';
import {
  createContract,
  getContracts,
  getUserContracts,
  updateContractStatus,
} from '../controllers/contract.controller';

const router = Router();

router.post('/', createContract);
router.get('/', getContracts);
router.get('/user/:userId', getUserContracts);
router.patch('/:id/status', updateContractStatus);

export default router;