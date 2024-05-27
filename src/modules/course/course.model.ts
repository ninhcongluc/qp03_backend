import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Timestamp } from 'typeorm';

@Entity('course')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'uuid', unique: true })
  teacherId?: string;

  @Column({ nullable: true })
  code?: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  semester?: string;

  @Column({ type: 'boolean', default: true })
  isActive?: boolean;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'timestamp', default: new Date() })
  createdAt?: Date;

  @Column({ type: 'date', default: new Date() })
  updatedAt: Date;
}
