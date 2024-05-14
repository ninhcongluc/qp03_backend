import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { DBIndexes } from '../../commons/consts/db.const';

@Index(DBIndexes.IDX_ROLE_NAME, ['name'], {
  unique: true
})
@Entity('role')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
