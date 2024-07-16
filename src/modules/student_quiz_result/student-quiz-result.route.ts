import { Router, Request, Response } from 'express';
import { authentication, authorization } from '../auth/auth.middleware';
import { StudentQuizResultService } from './student-quiz-result.service';
import AppDataSource from '../../configs/connect-db';
import { StudentQuizResultController } from './student-quiz-result.controller';
import schemaValidator from '../../middleware/schemaValidator';

const studentQuizResultRouter = Router();
const studentQuizResultService = new StudentQuizResultService(AppDataSource);
const studentQuizResultController = new StudentQuizResultController(studentQuizResultService);

// List Student Quiz Result History
studentQuizResultRouter.get(
  '/student/course-management/class/:classId/quiz/:quizId/history',
  authentication,
  authorization(['student']),
  (req: Request, res: Response) => {
    return studentQuizResultController.listStudentQuizResultHistory(req, res);
  }
);

// Review Quiz
studentQuizResultRouter.get(
  '/student/course-management/class/:classId/quiz/:quizId/review',
  authentication,
  authorization(['student']),
  (req: Request, res: Response) => {
    return studentQuizResultController.getReviewQuiz(req, res);
  }
);

// Do Quiz
studentQuizResultRouter.get(
  '/student/course-management/class/:classId/quiz/:quizId/do',
  authentication,
  authorization(['student']),
  (req: Request, res: Response) => {
    return studentQuizResultController.getDoQuiz(req, res);
  }
);

// student grades
studentQuizResultRouter.get(
  '/student-grades',
  authentication,
  authorization(['student']),
  (req: Request, res: Response) => {
    return studentQuizResultController.getStudentGrades(req, res);
  }
);
export default studentQuizResultRouter;
