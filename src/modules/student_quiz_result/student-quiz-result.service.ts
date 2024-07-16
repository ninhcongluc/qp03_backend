import { DataSource, Repository } from 'typeorm';
import { StudentQuizResult } from './student-quiz-result.model';
import { Class } from '../class/class.model';
import { Quiz } from '../quiz/quiz.model';
import { AppObject } from '../../commons/consts/app.objects';

export class StudentQuizResultService {
  private studentQuizResultRepository: Repository<StudentQuizResult>;

  constructor(private readonly dataSource: DataSource) {
    this.studentQuizResultRepository = this.dataSource.getRepository(StudentQuizResult);
  }

  async listStudentQuizResultHistory(
    userId: string,
    classId: string,
    quizId: string,
    query: { page?: number; limit?: number; name?: string }
  ) {
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
        .where('result.userId = :userId AND result.classId = :classId AND result.quizId = :quizId', {
          userId,
          classId,
          quizId
        });

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
        .where('result.userId = :userId AND result.classId = :classId AND result.quizId = :quizId', {
          userId,
          classId,
          quizId
        });

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
        .where('result.userId = :userId AND result.classId = :classId AND result.quizId = :quizId', {
          userId,
          classId,
          quizId
        });

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

  async getStudentGrades(studentId: string) {
    const latestResults = await this.studentQuizResultRepository
      .createQueryBuilder('result')
      .select('result.id', 'id')
      .addSelect('result.quizId', 'quizId')
      .addSelect('result.submitTime', 'submitTime')
      .addSelect('result.status', 'status')
      .addSelect('result.score', 'score')
      .leftJoinAndSelect('result.quiz', 'quiz')
      .leftJoinAndSelect('quiz.class', 'class')
      .leftJoinAndSelect('class.teacher', 'teacher')
      .leftJoinAndSelect('class.course', 'course')
      .where('result.studentId = :studentId', { studentId })
      .andWhere('result.status = :status', { status: 'done' })
      .orderBy('result.quizId, result.submitTime', 'DESC')
      .getRawMany();

    // Get the latest submission for each quiz
    const latestSubmissions = [];
    for (let i = 0; i < latestResults.length; i++) {
      const result = latestResults[i];
      const existingResultIndex = latestSubmissions.findIndex(r => r.quizId === result.quizId);
      if (existingResultIndex === -1 || latestSubmissions[existingResultIndex].submitTime < result.submitTime) {
        latestSubmissions.push(result);
      }
    }

    const mappedData = latestSubmissions.map((item, index) => ({
      id: index + 1,
      courseName: item.course_name,
      lecture: `${item.teacher_firstName} ${item.teacher_lastName}`,
      score: item.score,
      quizId: item.quiz_id,
      quizName: item.quiz_name
    }));

    return mappedData;
  }
}
