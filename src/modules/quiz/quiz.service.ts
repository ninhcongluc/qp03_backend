import { DataSource, In, Not, Repository } from 'typeorm';
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

      const duplicateName = await this.quizRepository.findOne({ where: { name: data.name, classId: data.classId } });
      if (duplicateName) {
        throw new Error('Quiz name is existed');
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
      const quizList = await this.quizRepository.find({
        where: { classId: String(classId) },
        order: { createdAt: 'DESC' }
      });

      const result = await Promise.all(
        quizList.map(async quiz => {
          const isTaken = await this.checkQuizIsTaken(quiz.id);
          return { ...quiz, isTaken };
        })
      );

      return result;
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

  async detailQuiz(quizId) {
    try {
      return await this.quizRepository.findOne({ where: { id: quizId } });
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
      const questions = await this.questionRepository.find({ where: { quizId: id } });
      if (questions.length > 0) {
        throw new Error('Quiz has questions, remove questions first');
      }
      // if quiz is used -> can not delete quiz
      const studentQuizResult = await this.studentQuizResultRepository.findOne({ where: { quizId: id } });
      if (studentQuizResult) {
        throw new Error('Quiz is used in system');
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
      // not update name is existed
      const duplicateName = await this.quizRepository.findOne({
        where: { name: data.name, classId: quiz.classId, id: Not(id) }
      });
      if (duplicateName) {
        throw new Error('Quiz name is existed');
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

  async saveAsDraft(quizId: string, userId: string, incomingQuestions: any, isSubmit = false) {
    try {
      console.log('incomming question', incomingQuestions);
      //validate data
      const quiz = await this.quizRepository.findOne({ where: { id: quizId } });
      if (!quiz) {
        throw new Error('Quiz not found');
      }
      if (incomingQuestions.length > 0 && quiz.status === QuizStatus.SUBMITTED) {
        console.log('validate');
        await this.validateQAScore(quiz, incomingQuestions);
      }
      const existingQuestions = (await this.listQuestionAnswers(quizId)).questions;

      const existingQuestionIds = existingQuestions.map(q => q.id);
      const existingAnswerIds = existingQuestions.flatMap(q => q.answerOptions.map(a => a.id));

      const incomingQuestionIds = incomingQuestions.map(q => q.id);

      const questionsToCreate = incomingQuestions.filter(q => !existingQuestionIds.includes(q.id));
      const questionsToUpdate = incomingQuestions.filter(q => existingQuestionIds.includes(q.id));
      const questionsToDelete = existingQuestions.filter(q => !incomingQuestionIds.includes(q.id));
      const newQuestionIds = [];

      for (const question of questionsToCreate) {
        delete question.id;
        const createdQuestion = await this.questionRepository.save({
          ...question,
          score: Number(question.score),
          quizId
        });
        newQuestionIds.push(createdQuestion.id);
        for (const answer of question.answerOptions) {
          await this.answerOptionRepository.save({
            ...answer,
            score: Number(answer.score),
            questionId: createdQuestion.id
          });
        }
      }

      for (const question of questionsToUpdate) {
        await this.questionRepository.update(
          { id: question.id },
          { text: question.text, type: question.type, score: Number(question.score) }
        );
        for (const answer of question.answerOptions) {
          if (existingAnswerIds.includes(answer.id)) {
            await this.answerOptionRepository.update({ id: answer.id }, { ...answer, score: Number(answer.score) });
          } else {
            await this.answerOptionRepository.save({ ...answer, score: Number(answer.score), questionId: question.id });
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
        // save to qbanks here
        await this.saveQuestionToBanks(userId, quizId, newQuestionIds);
      }
      return 'Save QA successfully';
    } catch (error) {
      throw new Error(error);
    }
  }

  async validateQAScore(quiz, questions) {
    const quizScore = Number(quiz.score);
    let totalQuestionScore = 0;
    for (let i = 0; i < questions.length; i++) {
      const answers = questions[i].answerOptions;
      const scorePerQuestion = Number(questions[i].score);
      totalQuestionScore += scorePerQuestion;
      const haveCorrectAnswer = answers.some(answer => answer.isCorrect === true);
      if (!haveCorrectAnswer) {
        throw new Error('Each question have at least one correct answer.');
      }

      if (questions[i].type === 'multiple_choice') {
        const totalScoreAnswerCorrect = answers.reduce((acc, answer) => {
          console.log(answer);
          if (answer.isCorrect) {
            return acc + Number(answer?.score || 0);
          }
          return acc;
        }, 0);

        if (totalScoreAnswerCorrect !== scorePerQuestion) {
          throw new Error('Total score of correct answer must be equal to score of question');
        }
      }
    }
    if (totalQuestionScore !== quizScore) {
      throw new Error('Total score of questions must be equal to score of quiz');
    }

    return true;
  }

  async saveQuestionToBanks(userId: string, quizId: string, questionIds: string[]) {
    const quizData = await this.quizRepository.findOne({
      where: { id: quizId },
      relations: ['class', 'class.course']
    });

    if (!quizData || !quizData.class || !quizData.class.courseId) {
      throw new Error('Course not found.');
    }

    const prepareData = questionIds.map(questionId => {
      return {
        teacherId: userId,
        courseId: quizData.class.courseId,
        questionId
      };
    });

    await this.questionBankRepository.save(prepareData);
  }

  async startQuiz(prepareData) {
    return await this.studentQuizResultRepository.save(prepareData);
  }

  async listStudentQuizResult(quizId: string) {
    try {
      const quiz = await this.quizRepository.findOne({
        where: { id: quizId },
        relations: ['questions']
      });
      const numberOfQuestions = quiz.questions.length;

      const result = await this.quizRepository
        .createQueryBuilder('quiz')
        .leftJoinAndSelect('quiz.studentQuizResults', 'studentQuizResults')
        .where('quiz.id = :quizId', { quizId })
        .orderBy('studentQuizResults.submitTime', 'ASC')
        .getOne();

      return {
        ...result,
        numberOfQuestions
      };
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

    //Calculate scores
    for (const { questionId, answerOptionIds } of studentQuizHistory.answers) {
      const question = await this.questionRepository.findOne({
        where: {
          id: questionId
        },
        relations: ['answerOptions']
      });
      if (!question) continue;

      const correctAnswers = question.answerOptions.filter(option => option.isCorrect).map(option => option.id);
      if (question.type === 'select_one') {
        const correctAnswer = correctAnswers[0];
        if (correctAnswer === answerOptionIds[0]) {
          totalScore += question.score;
          numberCorrectAnswers++;
        }
      }
      if (question.type === 'multiple_choice') {
        //nêú số lượng đáp án trả lời của học sinh khác với số số lượng đáp án đúng thì không tính điểm
        if (correctAnswers.length !== answerOptionIds.length) {
          continue;
        }

        // học sinh chọn được đáp án đúng nào thì sẽ được cộng điểm với đáp án đúng đó (điểm của từng answer đã được set)
        for (const answerId of answerOptionIds) {
          const answer = question.answerOptions.find(option => option.id === answerId);
          if (answer && answer.isCorrect) {
            totalScore += answer.score;
          }
        }

        // nếu học sinh chọn đúng số lượng câu và đúng hết thì số câu trả lời đúng sẽ tăng lên 1
        if (correctAnswers.every(answer => answerOptionIds.includes(answer))) {
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

    // eslint-disable-next-line prefer-const
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
    // eslint-disable-next-line no-useless-catch
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

  async getQuestionBanks(quizId: string, userId: string) {
    // eslint-disable-next-line no-useless-catch
    try {
      const quizData = await this.quizRepository.findOne({
        where: { id: quizId },
        relations: ['class', 'class.course']
      });

      if (!quizData || !quizData.class || !quizData.class.courseId) {
        throw new Error('Course not found.');
      }

      const questionBanks = await this.questionBankRepository.find({
        where: { teacherId: userId, courseId: quizData.class.courseId },
        select: ['questionId']
      });

      const questionIds = questionBanks.map(qb => qb.questionId);

      const questions = await this.questionRepository.find({
        where: { id: In(questionIds) },
        relations: ['answerOptions'],
        order: { createdAt: 'DESC' }
      });

      // Filter out duplicates based on the "text" field
      const uniqueQuestions = questions.reduce((acc, question) => {
        const exists = acc.some(q => q.text === question.text);
        if (!exists) {
          acc.push(question);
        }
        return acc;
      }, []);

      return uniqueQuestions;
    } catch (error) {
      throw error;
    }
  }

  async getStudentGrades(quizId: string) {
    // eslint-disable-next-line no-useless-catch
    try {
      const quiz = await this.quizRepository.findOne({ where: { id: quizId } });
      if (!quiz) {
        throw new Error('Quiz not found');
      }

      const studentQuizResults = await this.studentQuizResultRepository
        .createQueryBuilder('result')
        .innerJoin('result.student', 'student')
        .leftJoin('result.quiz', 'quiz')
        .where('result.quizId = :quizId AND result.status = :status', { quizId, status: StudentQuizStatus.DONE })
        .andWhere(
          `result."submitTime" = (SELECT MAX("submitTime") FROM student_quiz_results WHERE "studentId" = result."studentId" AND "quizId" = :quizId)`,
          { quizId }
        )
        .select([
          'result.id',
          'result.studentId',
          'result.status',
          'student.firstName',
          'student.lastName',
          'result.score',
          'result.numberCorrectAnswers',
          'result.submitTime',
          'quiz.name'
        ])
        .getMany();

      return studentQuizResults.map(result => ({
        id: result.id,
        quizName: result?.quiz.name,
        studentId: result.studentId,
        status: result.status,
        studentName: `${result.student.firstName} ${result.student.lastName}`,
        score: result.score,
        numberCorrectAnswers: result.numberCorrectAnswers,
        submitTime: result.submitTime
      }));
    } catch (error) {
      throw error;
    }
  }

  async checkQuizIsTaken(quizId: string) {
    try {
      const quiz = await this.quizRepository.findOne({ where: { id: quizId } });
      if (!quiz) {
        throw new Error('Quiz not found');
      }

      const studentQuizResult = await this.studentQuizResultRepository.findOne({
        where: { quizId }
      });

      return !!studentQuizResult;
    } catch (error) {
      throw error;
    }
  }
}
