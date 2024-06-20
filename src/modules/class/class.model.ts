import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Timestamp } from 'typeorm';
import { User } from '../user/user.model';
import { Course } from '../course/course.model';

@Entity('class')
export class Class {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  courseId: string;

  @Column({ type: 'uuid' })
  teacherId: string;

  @Column({ nullable: false })
  code: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'timestamp',
    nullable: false
  })
  startDate: Date;

  @Column({
    type: 'timestamp',
    nullable: false
  })
  endDate: Date;

  @Column({ type: 'integer', default: 50 })
  maxParticipants: number;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @Column({ type: 'timestamp', default: new Date() })
  createdAt?: Date;

  @Column({ type: 'date', default: new Date() })
  updatedAt: Date;

  @ManyToOne(() => Course)
  course: Course;

  @ManyToOne(() => User)
  teacher: User;
  
}
