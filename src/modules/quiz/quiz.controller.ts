import { Response, Request } from "express";
import { QuizService } from "./quiz.service";
import { StatusCodes } from "http-status-codes";

export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  async createQuiz(req: Request, res: Response) {
    try {
      const classId = String(req.params.classId);
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(req.body.endDate);
      const timeLimitMinutes = req.body.timeLimitMinutes;
      const scoreToPass = req.body.scoreToPass;
      const isHidden = req.body.isHidden;
      if(startDate < new Date() || endDate < new Date() || startDate > endDate){
        throw new Error("Invalid date");
      } 
      if(timeLimitMinutes < 0){
        throw new Error("Invalid time limit");
        
      }
      if(scoreToPass < 0 || scoreToPass > 100){
        throw new Error("Invalid score to pass");
      }
      if(isHidden !== true && isHidden !== false){
        throw new Error("Invalid is hidden");
      }
      const newQuiz = await this.quizService.createQuiz(req.body, classId);
      return res.status(201).send({ data: newQuiz, status: StatusCodes.CREATED });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async listQuiz(req: Request, res: Response) {
    try {
      const classId = String(req.params.classId);
      const quizzes = await this.quizService.listQuiz(classId);
      return res.status(200).send({ data: quizzes, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async getDetailQuiz(req: Request, res: Response) {
    try {
      const quizName = String(req.params.name);
      const classId = String(req.params.classId);
      const quiz = await this.quizService.getDetailQuiz(quizName,classId);
      return res.status(200).send({ data: quiz, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async deleteQuiz(req: Request, res: Response) {
    try {
      const classId = String(req.params.classId);
      const quizName = String(req.params.name);
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(req.body.endDate);
      const timeLimitMinutes = req.body.timeLimitMinutes;
      const scoreToPass = req.body.scoreToPass;
      const isHidden = req.body.isHidden;
      if(startDate < new Date() || endDate < new Date() || startDate > endDate){
        throw new Error("Invalid date");
      } 
      if(timeLimitMinutes < 0){
        throw new Error("Invalid time limit");
      }
      if(scoreToPass < 0 || scoreToPass > 100){
        throw new Error("Invalid score to pass");
      }
      if(isHidden !== true && isHidden !== false){
        throw new Error("Invalid is hidden");
      }
      const newQuiz = await this.quizService.deleteQuiz(quizName,classId);
      return res.status(201).send({ data: newQuiz, status: StatusCodes.CREATED });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async updateQuiz(req: Request, res: Response) {
    try {
      const classId = String(req.params.classId);
      const quizName = String(req.params.name);
      const updatedQuiz = await this.quizService.updateQuiz(quizName,classId,req.body);
      return res.status(201).send({ data: updatedQuiz, status: StatusCodes.CREATED });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }
}