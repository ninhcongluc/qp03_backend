import { Router } from 'express';
import userRouter from './modules/user/user.route';
import authRouter from './modules/auth/auth.route';
import semesterRouter from './modules/semester/semester.route';

// Create a new Router instance
const router = Router();

// Mount the routers
router.use('/auth', authRouter);

router.use('/', userRouter);

router.use('/', semesterRouter);

export default router;
