import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Class } from '../class/class.model';
import { Question } from '../question/question.model';
import { StudentQuizResult } from '../student_quiz_result/student-quiz-result.model';

export enum QuizStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted'
}

@Entity('quiz')
export class Quiz {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  classId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'enum', enum: QuizStatus, default: QuizStatus.DRAFT })
  status: QuizStatus;

  @Column({ type: 'timestamp', nullable: false })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: false })
  endDate: Date;

  @Column({ type: 'integer', default: 10 })
  score: number;

  @Column({ type: 'integer', nullable: false })
  timeLimitMinutes: number;

  @Column({ type: 'boolean', default: false })
  isLimitedAttempts: boolean;

  @Column({ type: 'integer', nullable: true })
  maxAttempts: number;

  @Column({ type: 'boolean', default: false })
  showAnswer?: boolean;

  @Column({ type: 'timestamp', default: new Date() })
  createdAt: Date;

  @Column({ type: 'timestamp', default: new Date() })
  updatedAt: Date;

  @ManyToOne(() => Class)
  class: Class;

  @OneToMany(() => Question, classEntity => classEntity.quiz)
  questions: Question[];

  @OneToMany(() => StudentQuizResult, classEntity => classEntity.quiz)
  studentQuizResults: StudentQuizResult[];
}
