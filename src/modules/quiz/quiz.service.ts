import { DataSource, Repository } from 'typeorm';
import { Quiz } from './quiz.model';
import { Class } from '../class/class.model';
import { AppObject } from '../../commons/consts/app.objects';
import { Question } from '../question/question.model';
import { AnswerOption } from '../answer_option/answer-option.model';
import { QuestionBank } from '../question_bank/question_bank.model';

export class QuizService {
  private quizRepository: Repository<Quiz>;
  private questionRepository: Repository<Question>;
  private answerOptionRepository: Repository<AnswerOption>;
  private questionBankRepository: Repository<QuestionBank>;
  private classRepository: Repository<Class>;

  constructor(private readonly dataSource: DataSource) {
    this.quizRepository = this.dataSource.getRepository(Quiz);
    this.questionRepository = this.dataSource.getRepository(Question);
    this.answerOptionRepository = this.dataSource.getRepository(AnswerOption);
    this.questionBankRepository = this.dataSource.getRepository(QuestionBank);
    this.classRepository = this.dataSource.getRepository(Class);
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
      const { page = AppObject.DEFAULT_PAGE, limit = AppObject.DEFAULT_LIMIT, name = '' } = query;
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

      const [data, total] = await queryBuilder.getManyAndCount();
      const mappedQuizzes = data.map(quiz => ({
        id: quiz.id,
        name: quiz.name,
        description: quiz.description,
        startDate: quiz.startDate,
        endDate: quiz.endDate
      }));

      const courseInfo = await this.classRepository
        .createQueryBuilder('class')
        .leftJoin('class.course', 'course')
        .select(['class.id', 'course.name', 'course.code', 'course.description'])
        .where('class.id = :classId', { classId })
        .getOne();

      return {
        page: Number(page),
        total,
        courseInfo,
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
        .orderBy('question.createdAt', 'ASC')
        .getOne();
    } catch (error) {
      return error;
    }
  }

  async saveAsDraft(quizId: string, incomingQuestions: any) {
    try {
      const existingQuestions = (await this.listQuestionAnswers(quizId)).questions;

      const existingQuestionIds = existingQuestions.map(q => q.id);
      const existingAnswerIds = existingQuestions.flatMap(q => q.answerOptions.map(a => a.id));

      const incomingQuestionIds = incomingQuestions.map(q => q.id);

      const questionsToCreate = incomingQuestions.filter(q => !existingQuestionIds.includes(q.id));
      const questionsToUpdate = incomingQuestions.filter(q => existingQuestionIds.includes(q.id));
      const questionsToDelete = existingQuestions.filter(q => !incomingQuestionIds.includes(q.id));

      for (const question of questionsToCreate) {
        delete question.id;
        const createdQuestion = await this.questionRepository.save({ ...question, quizId });
        for (const answer of question.answerOptions) {
          await this.answerOptionRepository.save({ ...answer, questionId: createdQuestion.id });
        }
      }

      for (const question of questionsToUpdate) {
        await this.questionRepository.update({ id: question.id }, { text: question.text, type: question.type });
        for (const answer of question.answerOptions) {
          if (existingAnswerIds.includes(answer.id)) {
            await this.answerOptionRepository.update({ id: answer.id }, { ...answer });
          } else {
            await this.answerOptionRepository.save({ ...answer, questionId: question.id });
          }
        }
      }

      for (const question of questionsToDelete) {
        await this.answerOptionRepository.delete({ questionId: question.id });
        await this.questionBankRepository.delete({ questionId: question.id });
        await this.questionRepository.delete(question.id);
      }

      for (const existingQuestion of existingQuestions) {
        for (const answer of existingQuestion.answerOptions) {
          if (!incomingQuestions.flatMap(q => q.answerOptions).some(a => a.id === answer.id)) {
            await this.answerOptionRepository.delete(answer.id);
          }
        }
      }
      return 'Save as draft successfully';
    } catch (error) {
      throw new Error(error);
    }
  }

  async listStudentQuizResult(quizId: string) {
    try {
      const quiz = await this.quizRepository.findOne({ where: { id: quizId } });
      if (!quiz) {
        throw new Error('Quiz not found');
      }

      return await this.quizRepository
        .createQueryBuilder('quiz')
        .leftJoinAndSelect('quiz.studentQuizResults', 'studentQuizResults')
        .where('quiz.id = :quizId', { quizId })
        .orderBy('studentQuizResults.submitTime', 'ASC')
        .getOne();
    } catch (error) {
      return error;
    }
  }
}
