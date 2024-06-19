import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp } from 'typeorm';
import { User } from '../user/user.model';
import { Semester } from '../semester/semester.model';
import { Class } from '../class/class.model';

@Entity('course')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'uuid' })
  managerId: string;

  @Column({ type: 'uuid' })
  semesterId: string;

  @Column({ nullable: false })
  code: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ type: 'timestamp', default: new Date() })
  createdAt?: Date;

  @Column({ type: 'date', default: new Date() })
  updatedAt: Date;

  @OneToMany(() => Class, classEntity => classEntity.course)
  classes: Class[];

  @ManyToOne(() => User)
  manager: User;

  @ManyToOne(() => Semester)
  semester: Semester;
}
