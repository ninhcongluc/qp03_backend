import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../role/role.model';
@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ nullable: true, unique: true })
  username?: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ type: 'varchar', nullable: true })
  firstName?: string;

  @Column({ type: 'varchar', nullable: true })
  lastName?: string;

  @Column({ nullable: true })
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

  @ManyToOne(() => Role, { onDelete: 'NO ACTION' })
  role?: Role;
}
