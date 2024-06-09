import { DataSource } from 'typeorm';
import { Role } from '../modules/role/role.model';
import { User } from '../modules/user/user.model';
import { Semester } from '../modules/semester/semester.model';
import { AnswerOption } from '../modules/answer_option/answer-option.model';
import { Quiz } from '../modules/quiz/quiz.model';
import { Class } from '../modules/class/class.model';
import { ClassParticipants } from '../modules/class_participants/class-participants.model';
import { Question } from '../modules/question/question.model';
import { QuestionBank } from '../modules/question_bank/question_bank.model';
import { StudentQuizResult } from '../modules/student_quiz_result/student-quiz-result.model';
import { Course } from '../modules/course/course.model';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.HOST,
  port: +process.env.DB_PORT,
  username: process.env.USER_DB,
  password: process.env.PASS,
  database: process.env.DATABASE,
  entities: [
    User,
    Role,
    Semester,
    Course,
    Class,
    Quiz,
    ClassParticipants,
    Quiz,
    Question,
    QuestionBank,
    AnswerOption,
    StudentQuizResult
  ],
  synchronize: true
});

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch(err => {
    console.error('Error during Data Source initialization', err);
  });

export default AppDataSource;
