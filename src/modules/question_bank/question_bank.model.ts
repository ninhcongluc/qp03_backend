import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Timestamp } from 'typeorm';
import { Course } from '../course/course.model';
import { Question } from '../question/question.model';
import { User } from '../user/user.model';

@Entity('question_bank')
export class QuestionBank {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  courseId: string;

  @Column({ type: 'uuid' })
  questionId: string;

  @Column({ type: 'uuid' })
  teacherId: string;

  @Column({ type: 'timestamp', default: new Date() })
  createdAt?: Date;

  @Column({ type: 'date', default: new Date() })
  updatedAt: Date;

  @ManyToOne(() => Course)
  course: Course;

  @ManyToOne(() => Question)
  question: Question;

  @ManyToOne(() => User)
  teacher: User;
}
