import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Timestamp } from 'typeorm';

@Entity('answer_option')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  questionId: string;

  @Column({ nullable: false })
  optionText: string;

  @Column({ type: 'boolean' })
  isCorrect: boolean;

  @Column({ type: 'timestamp', default: new Date() })
  createdAt?: Date;

  @Column({ type: 'date', default: new Date() })
  updatedAt: Date;
}
