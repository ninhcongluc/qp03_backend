import { DataSource, Repository } from 'typeorm';
import { User } from './user.model';

export class UserRepository extends Repository<User> {
  constructor(private readonly dataSource: DataSource) {}
}
