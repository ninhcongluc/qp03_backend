import { Router } from 'express';
import userRouter from './modules/user/user.route';
import authRouter from './modules/auth/auth.route';
import semesterRouter from './modules/semester/semester.route';
import quizRouter from './modules/quiz/quiz.route';
import classRouter from './modules/class/class.route';
import courseRouter from './modules/course/course.route';
import studentQuizResultRouter from './modules/student_quiz_result/student-quiz-result.route';
import questionRouter from './modules/question/question.route';

// Create a new Router instance
const router = Router();

// Mount the routers
router.use('/auth', authRouter);
router.use('/', userRouter);

router.use('/', semesterRouter);
router.use('/', quizRouter);

router.use('/', classRouter);
router.use('/', courseRouter);
router.use('/', studentQuizResultRouter);
router.use('/', questionRouter);


export default router;
