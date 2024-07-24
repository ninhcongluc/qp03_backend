import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('semester')
export class Semester {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ nullable: false })
  name: string;

  @Column({ default: true })
  isActive: boolean;

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
}
