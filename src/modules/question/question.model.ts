import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Quiz } from '../quiz/quiz.model';

@Entity('question')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'uuid' })
  quizId: string;

  @Column({ nullable: false, type: 'enum', enum: ['select_one', 'multiple_choice'] })
  type: string;

  @Column({ nullable: false })
  text: string;

  @Column({ nullable: true })
  file?: string;

  @Column({ type: 'timestamp', default: new Date() })
  createdAt: Date;

  @Column({ type: 'timestamp', default: new Date() })
  updatedAt: Date;

  @ManyToOne(() => Quiz)
  quiz: Quiz;
}
