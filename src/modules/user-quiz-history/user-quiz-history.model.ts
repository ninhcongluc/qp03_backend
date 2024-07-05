import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Quiz } from '../quiz/quiz.model';
import { User } from '../user/user.model';
import { AnswerOption } from '../answer_option/answer-option.model';

@Entity('student_quiz_history')
export class StudentQuizHistory {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  quizId: string;

  @Column({ type: 'uuid' })
  questionId: string;

  @Column()
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
}
