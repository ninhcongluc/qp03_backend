import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Quiz } from '../quiz/quiz.model';
import { OneToMany } from 'typeorm';
import { AnswerOption } from '../answer_option/answer-option.model';

@Entity('question')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'uuid', nullable: true })
  quizId: string | null;

  @Column({ nullable: false, type: 'enum', enum: ['select_one', 'multiple_choice'] })
  type: string;

  @Column()
  text: string;

  @Column({ type: 'float', default: 0 })
  score: number;

  @Column({ nullable: false })
  @Column({ nullable: true })
  file?: string;

  @Column({ type: 'integer', default: 0 })
  order: number;

  @Column({ type: 'timestamp', default: new Date() })
  createdAt: Date;

  @Column({ type: 'timestamp', default: new Date() })
  updatedAt: Date;

  @OneToMany(() => AnswerOption, classEntity => classEntity.question)
  answerOptions: AnswerOption[];

  @ManyToOne(() => Quiz)
  quiz: Quiz;
}
