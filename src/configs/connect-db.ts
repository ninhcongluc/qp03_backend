import { DataSource } from 'typeorm';
import { Role } from '../modules/role/role.model';
import { User } from '../modules/user/user.model';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.HOST,
  port: +process.env.DB_PORT,
  username: process.env.USER_DB,
  password: process.env.PASS,
  database: process.env.DATABASE,
  entities: [User, Role],
  synchronize: true
});

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch(err => {
    console.error('Error during Data Source initialization', err);
  });

export default AppDataSource;
