import { Response, Request } from 'express';
import { QuizService } from './quiz.service';
import { StatusCodes } from 'http-status-codes';
import { StudentQuizStatus } from '../student_quiz_result/student-quiz-result.model';

export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  validateQuizData(data, isEdit = false) {
    const { startDate, endDate, timeLimitMinutes, score, isLimitedAttempts, maxAttempts } = data;

    // Check startDate < current date
    if (!isEdit && new Date(startDate) < new Date()) {
      throw new Error('Start date must be greater than current date');
    }
    if (new Date(startDate) >= new Date(endDate)) {
      throw new Error('End date must be greater than start date');
    }
    if (timeLimitMinutes <= 0) {
      throw new Error('Time limit must be a positive number greater than zero.');
    }
    if (score !== 10 && score !== 100) {
      throw new Error('Score should be 10 or 100');
    }
    if (isLimitedAttempts && (maxAttempts < 1 || maxAttempts > 100)) {
      throw new Error('Max attempts must be between 1 and 100');
    }
    return true;
  }

  async createQuiz(req: Request, res: Response) {
    try {
      this.validateQuizData(req.body);
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
      this.validateQuizData(req.body);
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

  async saveAsDraft(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const isSubmit = Boolean(req.query.isSubmit);

      const result = await this.quizService.saveAsDraft(id, userId, req.body, isSubmit);
      return res.status(200).send({ data: result, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }
  async startQuiz(req, res) {
    try {
      const quizId = req.params.id;
      const prepareData = {
        quizId,
        studentId: req.user._id,
        status: StudentQuizStatus.DOING,
        score: 0,
        numberCorrectAnswers: 0
      };
      const result = await this.quizService.startQuiz(prepareData);
      return res.status(200).send({ data: result, status: StatusCodes.CREATED });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async listStudentQuizResult(req, res) {
    try {
      const studentId = req.user._id;
      const quizId = req.params.id;
      const result = await this.quizService.listStudentQuizResult(quizId, studentId);
      return res.status(200).send({ data: result, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async submitQuiz(req, res) {
    try {
      const quizId = req.params.id;
      const userId = req.user._id;
      const result = await this.quizService.submitQuiz(quizId, userId, req.body);
      return res.status(200).send({ data: result, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async saveAnswers(req, res) {
    try {
      const quizId = req.params.id;
      const userId = req.user._id;
      const result = await this.quizService.saveAnswers(quizId, userId, req.body);
      return res.status(200).send({ data: result, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async getStudentQuizHistory(req, res) {
    try {
      const quizResultId = req.params.quizResultId;
      const result = await this.quizService.getStudentQuizHistory(quizResultId);
      return res.status(200).send({ data: result, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async getQuizReview(req, res) {
    try {
      const quizResultId = req.params.quizResultId;
      const result = await this.quizService.getStudentQuizHistory(quizResultId);
      console.log(result);
      return res.status(200).send({ data: result, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async getQuestionBanks(req, res) {
    try {
      const quizId = req.params.id;
      const userId = req.user._id;

      const result = await this.quizService.getQuestionBanks(quizId, userId);
      return res.status(200).send({ data: result, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async getStudentGrades(req, res) {
    try {
      const quizId = req.params.id;
      const result = await this.quizService.getStudentGrades(quizId);
      return res.status(200).send({ data: result, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async checkQuizIsTaken(req, res) {
    try {
      const quizId = req.params.id;
      const result = await this.quizService.checkQuizIsTaken(quizId);
      return res.status(200).send({ data: result, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }
  async getQuizByExamType(req, res) {
    try {
      const teacherId = req.user._id;
      const result = await this.quizService.getQuizByExamType(teacherId);
      return res.status(200).send({ data: result, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async updateQuizSchedular(req, res) {
    try {
      const quizId = req.params.id;
      const { startDate, endDate } = req.body;
      if (!startDate || !endDate) {
        throw new Error('Start date and end date are required');
      }
      //endDate phai lon hon startDate
      if (new Date(startDate) >= new Date(endDate)) {
        throw new Error('End date must be greater than start date');
      }
      // startDate endDate phai trong cung 1 ngay
      if (new Date(startDate).getDate() !== new Date(endDate).getDate()) {
        throw new Error('Start date and end date must be in the same day');
      }

      const result = await this.quizService.updateQuizSchedular(quizId, startDate, endDate);

      return res.status(200).send({ data: result, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async getSchedularExamStudent(req, res) {
    try {
      const userId = req.user._id;
      const result = await this.quizService.getSchedularExamStudent(userId);
      return res.status(200).send({ data: result, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }
}
