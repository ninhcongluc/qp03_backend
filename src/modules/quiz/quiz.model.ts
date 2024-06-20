import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Class } from '../class/class.model';
import { Question } from '../question/question.model';

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

  @Column({ type: 'timestamp', nullable: false })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: false })
  endDate: Date;

  @Column({ type: 'integer', default: 10 })
  score: number;

  @Column({ type: 'integer', nullable: false })
  timeLimitMinutes: number;

  @Column({ type: 'boolean', default: false })
  isHidden?: boolean;

  @Column({ type: 'timestamp', default: new Date() })
  createdAt: Date;

  @Column({ type: 'timestamp', default: new Date() })
  updatedAt: Date;

  @ManyToOne(() => Class)
  class: Class;

  @OneToMany(() => Question, classEntity => classEntity.quiz)
  questions: Question[];
}
