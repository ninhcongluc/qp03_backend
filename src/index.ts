import { Router } from 'express';
import userRouter from './modules/user/user.route';
import authRouter from './modules/auth/auth.route';
import semesterRouter from './modules/semester/semester.route';
<<<<<<< HEAD
import quizRouter from './modules/quiz/quiz.route';
import classRouter from './modules/class/class.route';
=======
>>>>>>> 92188e6

// Create a new Router instance
const router = Router();

// Mount the routers
router.use('/auth', authRouter);

router.use('/', userRouter);

router.use('/', semesterRouter);
<<<<<<< HEAD
router.use('/', quizRouter);

router.use('/', classRouter);
=======
>>>>>>> 92188e6

export default router;
