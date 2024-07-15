import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Timestamp } from 'typeorm';
import { Question } from '../question/question.model';

@Entity('answer_option')
export class AnswerOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  questionId: string;

  @Column({ nullable: false })
  optionText: string;

  @Column({ type: 'boolean', default: false })
  isCorrect: boolean;

  @Column({ type: 'float', default: 0 })
  score: number;

  @Column({ type: 'timestamp', default: new Date() })
  createdAt?: Date;

  @Column({ type: 'date', default: new Date() })
  updatedAt: Date;

  @ManyToOne(() => Question)
  question: Question;
}
