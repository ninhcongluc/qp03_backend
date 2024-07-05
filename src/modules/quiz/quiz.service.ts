import { DataSource, Repository } from 'typeorm';
import { Quiz } from './quiz.model';
import { Class } from '../class/class.model';
import { AppObject } from '../../commons/consts/app.objects';

export class QuizService {
  private quizRepository: Repository<Quiz>;

  constructor(private readonly dataSource: DataSource) {
    this.quizRepository = this.dataSource.getRepository(Quiz);
  }

  async createQuiz(data: any) {
    try {
      const classExisted = await this.dataSource.getRepository(Class).findOne({ where: { id: String(data?.classId) } });
      if (!classExisted) {
        throw new Error('Class not found');
      }

      const newQuiz = this.quizRepository.create(data);
      return await this.quizRepository.save(newQuiz);
    } catch (error) {
      throw new Error(error);
    }
  }

  async listQuiz(classId: String) {
    try {
      const classExisted = await this.dataSource.getRepository(Class).findOne({ where: { id: String(classId) } });
      if (!classExisted) {
        throw new Error('Class not found');
      }
      return await this.quizRepository.find({ where: { classId: String(classId) }, order: { startDate: 'DESC' } });
    } catch (error) {
      return error;
    }
  }

  async listStudentQuizzes(userId: string, classId: string, query) {
    try {
      const { page = AppObject.DEFAULT_PAGE, limit = AppObject.DEFAULT_LIMIT, name = "" } = query;
      const queryBuilder = this.quizRepository
        .createQueryBuilder('quiz')
        .leftJoinAndSelect('quiz.class', 'class')
        .leftJoinAndSelect('class.classParticipants', 'classParticipants')
        .where('classParticipants.userId = :userId AND quiz.classId = :classId', { userId, classId });
  
      if (name) {
        queryBuilder.andWhere('quiz.name LIKE :name', { name: `%${name}%` });
      }
  
      queryBuilder.orderBy('quiz.startDate', 'ASC');
      queryBuilder.skip((Number(page) - 1) * Number(limit));
      queryBuilder.take(Number(limit));
  
      const [quizzes, total] = await queryBuilder.getManyAndCount();
      const mappedQuizzes = quizzes.map(quiz => ({
        id: quiz.id,
        name: quiz.name,
        description: quiz.description,
        startDate: quiz.startDate,
        endDate: quiz.endDate
      }));
  
      return {
        page: Number(page),
        total,
        quizzes: mappedQuizzes
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async detailQuiz(quizId: String) {
    try {
      return await this.quizRepository.findOne({ where: { id: String(quizId) } });
    } catch (error) {
      return error;
    }
  }

  async getDetailQuiz(quizName: String, classId: String) {
    try {
      const classExisted = await this.dataSource.getRepository(Class).findOne({ where: { id: String(classId) } });
      if (!classExisted) {
        throw new Error('Class not found');
      }
      return await this.quizRepository.findOne({ where: { name: String(quizName), classId: String(classId) } });
    } catch (error) {
      return error;
    }
  }

  async deleteQuiz(id: string) {
    try {
      const quiz = await this.quizRepository.findOne({ where: { id } });
      if (!quiz) {
        throw new Error('Quiz not found');
      }
      return await this.quizRepository.delete({ id });
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateQuiz(id: string, data: any) {
    try {
      const quiz = await this.quizRepository.findOne({ where: { id } });
      if (!quiz) {
        throw new Error('Quiz not found');
      }
      return await this.quizRepository.update(
        { id },
        {
          ...data,
          updatedAt: new Date()
        }
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  async listQuestionAnswers(quizId: string) {
    try {
      const quiz = await this.quizRepository.findOne({ where: { id: quizId } });
      console.log(quiz);
      if (!quiz) {
        throw new Error('Quiz not found');
      }
      return await this.quizRepository
        .createQueryBuilder('quiz')
        .leftJoinAndSelect('quiz.questions', 'question')
        .leftJoinAndSelect('question.answerOptions', 'answerOptions')
        .where('quiz.id = :quizId', { quizId })
        .orderBy('question.createdAt', 'DESC')
        .getOne();
    } catch (error) {
      return error;
    }
  }
}
