import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Quiz } from '../quiz/quiz.model';
import { OneToMany } from 'typeorm';
import { AnswerOption } from '../answer_option/answer-option.model';

@Entity('question')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'uuid' })
  quizId: string;

  @Column({ nullable: false, type: 'enum', enum: ['select_one', 'multiple_choice'] })
  type: string;

  @Column()
  text: string;

  @Column({ nullable: false })
  @Column({ nullable: true })
  file?: string;

  @Column({ type: 'timestamp', default: new Date() })
  createdAt: Date;

  @Column({ type: 'timestamp', default: new Date() })
  updatedAt: Date;

  @OneToMany(() => AnswerOption, classEntity => classEntity.question)
  answerOptions: AnswerOption[];

  @ManyToOne(() => Quiz)
  quiz: Quiz;
}
