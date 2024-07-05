import { DataSource, Repository } from "typeorm";
import { StudentQuizResult } from "./student-quiz-result.model";
import { Class } from "../class/class.model";
import { Quiz } from "../quiz/quiz.model";
import { AppObject } from "../../commons/consts/app.objects";

export class StudentQuizResultService {
  private studentQuizResultRepository: Repository<StudentQuizResult>;

  constructor(private readonly dataSource: DataSource) {
    this.studentQuizResultRepository = this.dataSource.getRepository(StudentQuizResult);
  }

  async listStudentQuizResultHistory(userId: string, classId: string, quizId: string, query: { page?: number; limit?: number; name?: string }) {
    try {
      const { page = AppObject.DEFAULT_PAGE, limit = AppObject.DEFAULT_LIMIT } = query;

      const classExisted = await this.dataSource.getRepository(Class).findOne({ where: { id: String(classId) } });
      if (!classExisted) {
        throw new Error('Class not found');
      }

      const quizExisted = await this.dataSource.getRepository(Quiz).findOne({ where: { id: String(quizId) } });
      if (!quizExisted) {
        throw new Error('Quiz not found');
      }

      const queryBuilder = this.studentQuizResultRepository
        .createQueryBuilder('result')
        .leftJoinAndSelect('result.quiz', 'quiz')
        .where('result.userId = :userId AND result.classId = :classId AND result.quizId = :quizId', { userId, classId, quizId });

      queryBuilder.orderBy('result.createdAt', 'DESC');
      queryBuilder.skip((Number(page) - 1) * Number(limit));
      queryBuilder.take(Number(limit));

      const [results, total] = await queryBuilder.getManyAndCount();

      return {
        page: Number(page),
        total,
        results
      };
    } catch (error) {
      throw new Error('Failed to list student quiz results history: ' + error.message);
    }
  }

  async getReviewQuiz(userId: string, classId: string, quizId: string, query: { page?: number; limit?: number }) {
    try {
      const { page = AppObject.DEFAULT_PAGE, limit = AppObject.DEFAULT_LIMIT } = query;

      const classExisted = await this.dataSource.getRepository(Class).findOne({ where: { id: String(classId) } });
      if (!classExisted) {
        throw new Error('Class not found');
      }

      const quizExisted = await this.dataSource.getRepository(Quiz).findOne({ where: { id: String(quizId) } });
      if (!quizExisted) {
        throw new Error('Quiz not found');
      }

      const queryBuilder = this.studentQuizResultRepository
        .createQueryBuilder('result')
        .leftJoinAndSelect('result.quiz', 'quiz')
        .leftJoinAndSelect('quiz.questions', 'questions')
        .leftJoinAndSelect('questions.answerOptions', 'answerOptions')
        .where('result.userId = :userId AND result.classId = :classId AND result.quizId = :quizId', { userId, classId, quizId });

      queryBuilder.orderBy('questions.createdAt', 'ASC');
      queryBuilder.skip((Number(page) - 1) * Number(limit));
      queryBuilder.take(Number(limit));

      const [results, total] = await queryBuilder.getManyAndCount();

      return {
        page: Number(page),
        total,
        results
      };
    } catch (error) {
      throw new Error('Failed to get quiz review: ' + error.message);
    }
  }

  async getDoQuiz(userId: string, classId: string, quizId: string, query: { page?: number; limit?: number }) {
    try {
      const { page = AppObject.DEFAULT_PAGE, limit = AppObject.DEFAULT_LIMIT } = query;

      const classExisted = await this.dataSource.getRepository(Class).findOne({ where: { id: String(classId) } });
      if (!classExisted) {
        throw new Error('Class not found');
      }

      const quizExisted = await this.dataSource.getRepository(Quiz).findOne({ where: { id: String(quizId) } });
      if (!quizExisted) {
        throw new Error('Quiz not found');
      }

      const queryBuilder = this.studentQuizResultRepository
        .createQueryBuilder('result')
        .leftJoinAndSelect('result.quiz', 'quiz')
        .leftJoinAndSelect('quiz.questions', 'questions')
        .leftJoinAndSelect('questions.answerOptions', 'answerOptions')
        .where('result.userId = :userId AND result.classId = :classId AND result.quizId = :quizId', { userId, classId, quizId });

      queryBuilder.orderBy('questions.createdAt', 'ASC');
      queryBuilder.skip((Number(page) - 1) * Number(limit));
      queryBuilder.take(Number(limit));

      const [results, total] = await queryBuilder.getManyAndCount();

      return {
        page: Number(page),
        total,
        results
      };
    } catch (error) {
      throw new Error('Failed to get quiz details: ' + error.message);
    }
  }
}
