import { Router, Request, Response } from 'express';
import { authentication, authorization } from '../auth/auth.middleware';
import { QuizService } from './quiz.service';
import AppDataSource from '../../configs/connect-db';
import { QuizController } from './quiz.controller';
import schemaValidator from '../../middleware/schemaValidator';

const quizRouter = Router();
const quizService = new QuizService(AppDataSource);
const quizController = new QuizController(quizService);

// Quiz routes
quizRouter.post(
  '/quiz/create',
  authentication,
  authorization(['teacher']),
  schemaValidator('/quiz/create'),
  (req: Request, res: Response) => {
    return quizController.createQuiz(req, res);
  }
);

//list-quiz by classId
quizRouter.get(
  '/quiz/:classId',
  authentication,
  authorization(['teacher', 'student']),
  (req: Request, res: Response) => {
    return quizController.listQuiz(req, res);
  }
);

quizRouter.get(
  '/quiz/detail/:quizId',
  authentication,
  authorization(['teacher', 'student']),
  (req: Request, res: Response) => {
    return quizController.detailQuiz(req, res);
  }
);

quizRouter.get(
  '/searchQuiz/:classId&&:name',
  authentication,
  authorization(['teacher', 'student']),
  (req: Request, res: Response) => {
    return quizController.getDetailQuiz(req, res);
  }
);

quizRouter.delete('/quiz/:id', (req: Request, res: Response) => {
  return quizController.deleteQuiz(req, res);
});

quizRouter.put(
  '/quiz/:id',
  authentication,
  authorization(['teacher']),
  schemaValidator('/quiz/update'),
  (req: Request, res: Response) => {
    return quizController.updateQuiz(req, res);
  }
);

quizRouter.get('/quiz/:id/question-answers', (req: Request, res: Response) => {
  return quizController.listQuestionAnswers(req, res);
});

export default quizRouter;
