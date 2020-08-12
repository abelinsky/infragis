import express from 'express';
import { createUserController } from '../../../useCases/createUser';

const router = express.Router();

router.post('/api/users/signup', (req, res) =>
  createUserController.execute(req, res)
);

export { router as usersRouter };
