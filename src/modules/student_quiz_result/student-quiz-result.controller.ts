import { Response, Request } from 'express';
import { StudentQuizResultService } from './student-quiz-result.service';
import { StatusCodes } from 'http-status-codes';

export class StudentQuizResultController {
  constructor(private readonly studentQuizResultService: StudentQuizResultService) {}

  async listStudentQuizResultHistory(req, res) {
    try {
      const userId = req.user._id;
      const classId = String(req.params.classId);
      const quizId = String(req.params.quizId);
      const results = await this.studentQuizResultService.listStudentQuizResultHistory(
        userId,
        classId,
        quizId,
        req.query
      );
      return res.status(200).send({ data: results, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async getReviewQuiz(req, res) {
    try {
      const userId = req.user._id;
      const classId = String(req.params.classId);
      const quizId = String(req.params.quizId);
      const review = await this.studentQuizResultService.getReviewQuiz(userId, classId, quizId, req.query);
      return res.status(200).send({ data: review, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async getDoQuiz(req, res) {
    try {
      const userId = req.user._id;
      const classId = String(req.params.classId);
      const quizId = String(req.params.quizId);
      const doQuiz = await this.studentQuizResultService.getDoQuiz(userId, classId, quizId, req.query);
      return res.status(200).send({ data: doQuiz, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async getStudentGrades(req, res) {
    try {
      const studentId = req.user._id;
      const grades = await this.studentQuizResultService.getStudentGrades(studentId);
      return res.status(200).send({ data: grades, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }
}
