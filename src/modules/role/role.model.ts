import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('role')
export class Role {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ nullable: true, unique: true })
  name?: string;
}
