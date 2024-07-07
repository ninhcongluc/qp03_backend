import { DataSource, Repository } from 'typeorm';
import { Quiz, QuizStatus } from './quiz.model';
import { Class } from '../class/class.model';
import { AppObject } from '../../commons/consts/app.objects';
import { Question } from '../question/question.model';
import { AnswerOption } from '../answer_option/answer-option.model';
import { QuestionBank } from '../question_bank/question_bank.model';
import { StudentQuizResult, StudentQuizStatus } from '../student_quiz_result/student-quiz-result.model';
import { StudentQuizHistory } from '../user-quiz-history/user-quiz-history.model';

export class QuizService {
  private quizRepository: Repository<Quiz>;
  private questionRepository: Repository<Question>;
  private answerOptionRepository: Repository<AnswerOption>;
  private questionBankRepository: Repository<QuestionBank>;
  private classRepository: Repository<Class>;
  private studentQuizResultRepository: Repository<StudentQuizResult>;
  private studentQuizHistoryRepository: Repository<StudentQuizHistory>;

  constructor(private readonly dataSource: DataSource) {
    this.quizRepository = this.dataSource.getRepository(Quiz);
    this.questionRepository = this.dataSource.getRepository(Question);
    this.answerOptionRepository = this.dataSource.getRepository(AnswerOption);
    this.questionBankRepository = this.dataSource.getRepository(QuestionBank);
    this.classRepository = this.dataSource.getRepository(Class);
    this.studentQuizResultRepository = this.dataSource.getRepository(StudentQuizResult);
    this.studentQuizHistoryRepository = this.dataSource.getRepository(StudentQuizHistory);
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
        .where('classParticipants.userId = :userId AND quiz.classId = :classId AND quiz.status = :status', {
          userId,
          classId,
          status: QuizStatus.SUBMITTED
        });

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

  async saveAsDraft(quizId: string, incomingQuestions: any, isSubmit = false) {
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

      if (isSubmit) {
        await this.quizRepository.update({ id: quizId }, { status: QuizStatus.SUBMITTED });
      }
      return 'Save QA successfully';
    } catch (error) {
      throw new Error(error);
    }
  }

  async startQuiz(prepareData) {
    return await this.studentQuizResultRepository.save(prepareData);
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

  async submitQuiz(quizId: string, userId: string, data) {
    const { quizResultId, answers } = data;
    const quiz = await this.quizRepository.findOne({ where: { id: quizId } });
    const totalQuestions = await this.questionRepository.count({ where: { quizId } });

    if (!quiz) throw new Error('Quiz not found');
    if (totalQuestions < 1) throw new Error('Quiz has no question');

    const scorePerQuestion = quiz.score / totalQuestions;
    const currentTime = new Date();
    let totalScore = 0;
    let numberCorrectAnswers = 0;

    let studentQuizHistory = await this.studentQuizHistoryRepository.findOne({
      where: { studentQuizResultId: quizResultId }
    });

    if (!studentQuizHistory) {
      studentQuizHistory = new StudentQuizHistory();
      studentQuizHistory.userId = userId;
      studentQuizHistory.quizId = quizId;
      studentQuizHistory.studentQuizResultId = quizResultId;
    }

    studentQuizHistory.answers = this.parseAnswers(answers);

    for (const { questionId, answerOptionIds } of studentQuizHistory.answers) {
      const question = await this.questionRepository.findOne({
        where: {
          id: questionId
        },
        relations: ['answerOptions']
      });
      if (!question) continue;

      const correctAnswers = question.answerOptions.filter(option => option.isCorrect).map(option => option.id);
      const isMultipleChoice = question.type === 'multiple_choice';

      if (isMultipleChoice) {
        const correctCount = answerOptionIds.filter(id => correctAnswers.includes(id)).length;
        const incorrectCount = answerOptionIds.length - correctCount;

        if (correctCount === correctAnswers.length && incorrectCount === 0) {
          totalScore += scorePerQuestion;
          numberCorrectAnswers++;
        } else if (correctCount > 0 && incorrectCount === 0) {
          totalScore += (scorePerQuestion * correctCount) / correctAnswers.length;
        }
      } else {
        if (correctAnswers.includes(answerOptionIds[0])) {
          totalScore += scorePerQuestion;
          numberCorrectAnswers++;
        }
      }
    }

    await this.studentQuizHistoryRepository.save(studentQuizHistory);

    await this.studentQuizResultRepository.update(
      { id: quizResultId },
      {
        score: totalScore,
        numberCorrectAnswers,
        submitTime: currentTime,
        takeTimeSecs: 0,
        status: StudentQuizStatus.DONE
      }
    );

    return 'Submitted Quiz successfully';
  }

  private parseAnswers(answers: any): { questionId: string; answerOptionIds: string[] }[] {
    if (Array.isArray(answers)) {
      return answers;
    } else if (typeof answers === 'object') {
      return Object.entries(answers).map(([questionId, answerOptionIds]) => ({
        questionId,
        answerOptionIds: Array.isArray(answerOptionIds) ? answerOptionIds : [answerOptionIds]
      }));
    } else {
      throw new Error('Invalid answers data format');
    }
  }

  async saveAnswers(quizId: string, userId: string, { quizResultId, answers, timeLeft }) {
    const quiz = await this.quizRepository.findOne({ where: { id: quizId } });
    if (!quiz) throw new Error('Quiz not found');

    let studentQuizHistory = await this.studentQuizHistoryRepository.findOne({
      where: {
        userId,
        quizId,
        studentQuizResultId: quizResultId
      }
    });

    if (studentQuizHistory) {
      studentQuizHistory.timeLeft = timeLeft;
      studentQuizHistory.answers = Array.isArray(answers)
        ? answers
        : Object.entries(answers).map(([questionId, answerOptionIds]) => ({
            questionId,
            answerOptionIds: Array.isArray(answerOptionIds) ? answerOptionIds : [answerOptionIds]
          }));
      await this.studentQuizHistoryRepository.save(studentQuizHistory);
    } else {
      await this.studentQuizHistoryRepository.save({
        userId,
        quizId,
        studentQuizResultId: quizResultId,
        timeLeft,
        answers: Array.isArray(answers)
          ? answers
          : Object.entries(answers).map(([questionId, answerOptionIds]) => ({
              questionId,
              answerOptionIds: Array.isArray(answerOptionIds) ? answerOptionIds : [answerOptionIds]
            }))
      });
    }

    return 'Save answers successfully';
  }

  async getStudentQuizHistory(quizResultId: string) {
    try {
      const [quizHistory, quizResult] = await Promise.all([
        this.studentQuizHistoryRepository.findOne({ where: { studentQuizResultId: quizResultId } }),
        this.studentQuizResultRepository.findOne({ where: { id: quizResultId } })
      ]);

      if (!quizHistory || !quizResult) {
        throw new Error('Quiz history or result not found');
      }
      const quizData = await this.listQuestionAnswers(quizHistory.quizId);

      return {
        quizName: quizData.name,
        quizScore: quizData.score,
        score: quizResult.score,
        numberCorrectAnswers: quizResult.numberCorrectAnswers,
        questions: quizData.questions,
        ...quizHistory,
        createdAt: quizHistory.createdAt,
        updatedAt: quizHistory.updatedAt
      };
    } catch (error) {
      throw error;
    }
  }
}
