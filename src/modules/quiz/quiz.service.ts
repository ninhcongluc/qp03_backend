import { DataSource, Repository } from 'typeorm';
import { Quiz } from './quiz.model';
import { Class } from '../class/class.model';
import { Question } from '../question/question.model';

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
