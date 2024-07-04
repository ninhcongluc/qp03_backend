import { DataSource, Repository } from 'typeorm';
import { StudentQuizResult } from './student-quiz-result.model';
import { Quiz } from '../quiz/quiz.model';
import { User } from '../user/user.model';

export class StudentQuizResultService {
  private studentQuizResultRepository: Repository<StudentQuizResult>;

  constructor(private readonly dataSource: DataSource) {
    this.studentQuizResultRepository = this.dataSource.getRepository(StudentQuizResult);
  }

  async createStudentQuizResult(data: any) {
    try {
      const quizExisted = await this.dataSource.getRepository(Quiz).findOne({ where: { id: String(data.quizId) } });
      if (!quizExisted) {
        throw new Error('Quiz not found');
      }

      const studentExisted = await this.dataSource.getRepository(User).findOne({ where: { id: String(data.studentId) } });
      if (!studentExisted) {
        throw new Error('Student not found');
      }

      const newResult = this.studentQuizResultRepository.create(data);
      return await this.studentQuizResultRepository.save(newResult);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async listStudentQuizResults(studentId: string) {
    try {
      const studentExisted = await this.dataSource.getRepository(User).findOne({ where: { id: String(studentId) } });
      if (!studentExisted) {
        throw new Error('Student not found');
      }

      return await this.studentQuizResultRepository.find({
        where: { studentId: String(studentId) },
        relations: ['quiz'],
        order: { submissionTime: 'DESC' },
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async detailStudentQuizResult(resultId: string) {
    try {
      const result = await this.studentQuizResultRepository.findOne({
        where: { id: String(resultId) },
        relations: ['quiz'],
      });
      if (!result) {
        throw new Error('Result not found');
      }
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
