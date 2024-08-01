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

//list-the-quizzes-student
quizRouter.get(
  '/student/course-management/class/:classId',
  authentication,
  authorization(['student']),
  (req: Request, res: Response) => {
    return quizController.listStudentQuizzes(req, res);
  }
);

//list-quiz by classId
quizRouter.get('/quiz/:classId', authentication, authorization(['teacher']), (req: Request, res: Response) => {
  return quizController.listQuiz(req, res);
});

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

//save question - answers
quizRouter.put('/quiz/:id/save-qa', authentication, authorization(['teacher']), (req: Request, res: Response) => {
  return quizController.saveAsDraft(req, res);
});

/**Student */
quizRouter.post('/quiz/:id/start-quiz', authentication, authorization(['student']), (req: Request, res: Response) => {
  return quizController.startQuiz(req, res);
});

quizRouter.get('/quiz/:id/history', authentication, authorization(['student']), (req: Request, res: Response) => {
  return quizController.listStudentQuizResult(req, res);
});

quizRouter.post('/quiz/:id/submit', authentication, authorization(['student']), (req: Request, res: Response) => {
  return quizController.submitQuiz(req, res);
});

quizRouter.post(
  '/quiz/:id/auto-save-answers',
  authentication,
  authorization(['student']),
  (req: Request, res: Response) => {
    return quizController.saveAnswers(req, res);
  }
);

quizRouter.get(
  '/student-quiz-result/:quizResultId',
  authentication,
  authorization(['student']),
  (req: Request, res: Response) => {
    return quizController.getStudentQuizHistory(req, res);
  }
);

quizRouter.get(
  '/student-review-quiz/:quizResultId',
  authentication,
  authorization(['student']),
  (req: Request, res: Response) => {
    return quizController.getQuizReview(req, res);
  }
);

/**Bank */
quizRouter.get('/quiz/:id/question-banks', authentication, (req: Request, res: Response) => {
  return quizController.getQuestionBanks(req, res);
});

quizRouter.get(
  '/quiz/:id/student-grades',
  authentication,
  authorization(['teacher']),
  (req: Request, res: Response) => {
    return quizController.getStudentGrades(req, res);
  }
);

//check quiz is taken by student
quizRouter.get('/quiz/:id/check-quiz', authentication, (req: Request, res: Response) => {
  return quizController.checkQuizIsTaken(req, res);
});

quizRouter.get('/quiz/schedular/exam', authentication, authorization(['teacher']), (req: Request, res: Response) => {
  return quizController.getQuizByExamType(req, res);
});

quizRouter.put('/quiz/:id/schedular', authentication, authorization(['teacher']), (req: Request, res: Response) => {
  return quizController.updateQuizSchedular(req, res);
});

quizRouter.get(
  '/quiz/student-exam/schedular',
  authentication,
  authorization(['student']),
  (req: Request, res: Response) => {
    return quizController.getSchedularExamStudent(req, res);
  }
);

export default quizRouter;
