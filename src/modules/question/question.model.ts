import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('question')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'text' })
  optionText: string;

  @Column({ nullable: true })
  isCorrect: boolean;

  @Column({ type: 'timestamp', default: new Date() })
  createdAt: Date;

  @Column({ type: 'timestamp', default: new Date() })
  updatedAt: Date;
}
