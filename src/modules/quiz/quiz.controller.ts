import { Response, Request } from 'express';
import { QuizService } from './quiz.service';
import { StatusCodes } from 'http-status-codes';

export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  async createQuiz(req: Request, res: Response) {
    try {
      const { startDate, endDate, timeLimitMinutes, score } = req.body;
      if (startDate > endDate) {
        throw new Error('End date must be greater than start date');
      }
      if (timeLimitMinutes < 0) {
        throw new Error('Invalid time limit');
      }
      console.log(score);
      if (score !== 10 && score !== 100) {
        throw new Error('Score should be 10 or 100');
      }

      const newQuiz = await this.quizService.createQuiz(req.body);
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

  async listStudentQuizzes(req, res) {
    try {
      const classId = req.params.classId;
      const userId = req.user._id;
      const { type } = req.query;

      if (type === 'quizzes') {
        const quizzes = await this.quizService.listStudentQuizzes(userId, classId, req.query);
        return res.status(200).send({ data: quizzes, status: StatusCodes.OK });
      } else {
        return res.status(400).send({ error: 'Invalid type parameter', status: StatusCodes.BAD_REQUEST });
      }
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async detailQuiz(req: Request, res: Response) {
    try {
      const quizId = String(req.params.quizId);
      const quiz = await this.quizService.detailQuiz(quizId);
      return res.status(200).send({ data: quiz, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async getDetailQuiz(req: Request, res: Response) {
    try {
      const quizName = String(req.params.name);
      const classId = String(req.params.classId);
      const quiz = await this.quizService.getDetailQuiz(quizName, classId);
      return res.status(200).send({ data: quiz, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async deleteQuiz(req: Request, res: Response) {
    try {
      const id = req.params.id;
      await this.quizService.deleteQuiz(id);
      return res.status(200).send({ message: 'You have deleted successfully', status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async updateQuiz(req: Request, res: Response) {
    try {
      const id = req.params.id;

      const updatedQuiz = await this.quizService.updateQuiz(id, req.body);
      return res.status(201).send({ data: updatedQuiz, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async listQuestionAnswers(req: Request, res: Response) {
    try {
      const quizId = String(req.params.id);
      const questions = await this.quizService.listQuestionAnswers(quizId);
      return res.status(200).send({ data: questions, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async saveAsDraft(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const isSubmit = Boolean(req.query.isSubmit);

      const result = await this.quizService.saveAsDraft(id, req.body, isSubmit);
      return res.status(200).send({ data: result, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async listStudentQuizResult(req: Request, res: Response) {
    try {
      const quizId = req.params.id;
      const result = await this.quizService.listStudentQuizResult(quizId);
      return res.status(200).send({ data: result, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }
}
