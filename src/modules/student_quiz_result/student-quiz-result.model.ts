import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Quiz } from '../quiz/quiz.model';
import { User } from '../user/user.model';

export enum StudentQuizStatus {
  DOING = 'doing',
  DONE = 'done'
}

@Entity('student_quiz_results')
export class StudentQuizResult {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'uuid' })
  quizId: string;

  @Column({ type: 'uuid' })
  studentId: string;

  @Column({ nullable: false, type: 'enum', enum: StudentQuizStatus })
  status: string;

  @Column({ type: 'float', default: 0 })
  score: number;

  @Column({ type: 'integer', default: 0 })
  numberCorrectAnswers: number;

  @Column({ type: 'timestamp', nullable: true })
  submitTime: Date;

  @Column({ type: 'bigint', nullable: true })
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
