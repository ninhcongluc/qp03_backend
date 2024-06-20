import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Quiz } from '../quiz/quiz.model';
import { User } from '../user/user.model';

@Entity('student_quiz_results')
export class StudentQuizResult {
  @PrimaryGeneratedColumn('uuid')
  id?: string ;

  @Column({ type: 'uuid' })
  quizId: string;

  @Column({ type: 'uuid' })
  studentId: string;

  @Column({ nullable: false, type: 'enum', enum: ['not_yet', 'doing', 'done'] })
  status: string;

  @Column({ type: 'integer', default: 0 })
  score: number;

  @Column({ type: 'integer', nullable: false })
  numberQuestions: number;

  @Column({ type: 'integer', default: 0 })
  numberCorrectAnswers: number;

  @Column({ type: 'date', nullable: false })
  submissionTime: Date;

  @Column({ type: 'integer', nullable: true })
  takeTimeSecs?: number;

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
}
