import { Request, Response } from 'express';
import { StudentQuizResultService } from './student-quiz-result.service';
import { StatusCodes } from 'http-status-codes';

export class StudentQuizResultController {
  constructor(private readonly studentQuizResultService: StudentQuizResultService) {}

  async getStudentQuizResults(req, res) {
    try {
      const studentId = req.user._id;
      const results = await this.studentQuizResultService.listStudentQuizResults(studentId);
      return res.status(StatusCodes.OK).send({ data: results, status: StatusCodes.OK });
    } catch (error) {
      return res.status(StatusCodes.BAD_REQUEST).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async getStudentQuizResultDetail(req: Request, res: Response) {
    try {
      const { resultId } = req.params;
      const result = await this.studentQuizResultService.detailStudentQuizResult(resultId);
      return res.status(StatusCodes.OK).send({ data: result, status: StatusCodes.OK });
    } catch (error) {
      return res.status(StatusCodes.BAD_REQUEST).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }
}
