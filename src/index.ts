import { Router } from 'express';
import userRouter from './modules/user/user.route';
import authRouter from './modules/auth/auth.route';

// Create a new Router instance
const router = Router();

// Mount the routers
router.use('/auth', authRouter);

router.use('/', userRouter);

export default router;
