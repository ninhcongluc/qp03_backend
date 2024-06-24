import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../role/role.model';
import { ClassParticipants } from '../class_participants/class-participants.model';
@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ nullable: true, unique: true })
  code?: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ type: 'varchar', nullable: true })
  firstName?: string;

  @Column({ type: 'varchar', nullable: true })
  lastName?: string;

  @Column({ nullable: true, unique: true })
  email?: string;

  @Column({ type: 'smallint', nullable: true })
  gender?: number;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ nullable: true })
  googleId?: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ default: false })
  isActive?: boolean;

  @Column({ default: false })
  isDeleted?: boolean;

  otpCode: string;

  otpExpiredAt: Date;

  @Column({
    type: 'timestamp',
    default: new Date()
  })
  createdAt?: Date;

  @Column({
    type: 'timestamp',
    default: new Date()
  })
  updatedAt?: Date;

  @Column({ nullable: false })
  roleId: number;

  @OneToMany(() => ClassParticipants, classParticipants => classParticipants.user)
  classParticipants: ClassParticipants[];

  @ManyToOne(() => Role, { onDelete: 'NO ACTION' })
  role?: Role;
}
