import { Router, Request, Response } from 'express';
import { authentication, authorization } from '../auth/auth.middleware';
import { StudentQuizResultService } from './student-quiz-result.service';
import AppDataSource from '../../configs/connect-db';
import { StudentQuizResultController } from './student-quiz-result.controller';

const studentQuizResultRouter = Router();
const studentQuizResultService = new StudentQuizResultService(AppDataSource);
const studentQuizResultController = new StudentQuizResultController(studentQuizResultService);

studentQuizResultRouter.get(
  '/student-quiz-results',
  authentication,
  authorization(['student']),
  (req: Request, res: Response) => studentQuizResultController.getStudentQuizResults(req, res)
);

studentQuizResultRouter.get(
  '/student-quiz-result/:resultId',
  authentication,
  authorization(['student']),
  (req: Request, res: Response) => studentQuizResultController.getStudentQuizResultDetail(req, res)
);

export default studentQuizResultRouter;
