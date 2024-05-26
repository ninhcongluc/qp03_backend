import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';


@Entity('role')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ nullable: true, unique: true})
  username?: string;
}
