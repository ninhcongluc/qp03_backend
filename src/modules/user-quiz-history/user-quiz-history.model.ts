import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Quiz } from '../quiz/quiz.model';
import { User } from '../user/user.model';
import { AnswerOption } from '../answer_option/answer-option.model';
import { StudentQuizResult } from '../student_quiz_result/student-quiz-result.model';

@Entity('student_quiz_history')
export class StudentQuizHistory {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  quizId: string;

  @Column({ type: 'uuid' })
  studentQuizResultId: string;

  @Column({ type: 'uuid' })
  questionId: string;

  @Column({
    type: 'text',
    array: true,
    nullable: true,
    default: '{}'
  })
  answerOptionIds: string[];

  @Column({
    type: 'timestamp',
    default: new Date()
  })
  createdAt?: Date;

  @Column({
    type: 'timestamp',
    default: new Date()
  })
  updatedAt?: Date;

  @ManyToOne(() => Quiz)
  quiz: Quiz;

  @ManyToOne(() => User)
  student: User;

  @ManyToOne(() => User)
  answerOption: AnswerOption;

  @OneToOne(() => StudentQuizResult)
  studentQuizResult: StudentQuizResult;
}
