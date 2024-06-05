import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.model';
import { Class } from '../class/class.model';

@Entity('class_participants')
export class ClassParticipants {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  classId: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Class)
  class: Class;
}
