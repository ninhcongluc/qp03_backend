import { Router,Request, Response } from "express";
import { authentication, authorization } from "../auth/auth.middleware";
import { QuizService } from "./quiz.service";
import AppDataSource from "../../configs/connect-db";
import { QuizController } from "./quiz.controller";
import schemaValidator from "../../middleware/schemaValidator";

const quizRouter = Router();
const quizService = new QuizService(AppDataSource);
const quizController = new QuizController(quizService);

// Quiz routes
quizRouter.post(
  '/create/:classId',
  authentication,
  authorization(["teacher"]),
  schemaValidator("/quiz/create"),
  (req: Request, res: Response) => {
    return quizController.createQuiz(req, res);
  }
);

quizRouter.get("/listQuiz/:classId", authentication, authorization(["teacher","student"]), (req: Request, res: Response) => {
  return quizController.listQuiz(req, res);
});

quizRouter.get("/searchQuiz/:classId&&:name", authentication, authorization(["teacher","student"]), (req: Request, res: Response) => {
    return quizController.getDetailQuiz(req, res);
});

quizRouter.delete("/deleteQuiz/:classId&&:name", authentication, authorization(["teacher"]), (req: Request, res: Response) => {
    return quizController.deleteQuiz(req, res);
});

quizRouter.put("/updateQuiz/:classId&&:name", authentication, authorization(["teacher"]), schemaValidator("/quiz/update"),(req: Request, res: Response) => {
    return quizController.updateQuiz(req, res);
});

export default quizRouter;

