import express from 'express';
import 'dotenv/config';
import AppDataSource from './src/configs/connect-db';

const app = express();

const serverPort = process.env.PORT || 8000;

AppDataSource.initialize()
  .then(() => {
    console.log('DB has connected successfully!');
  })
  .catch(error => {
    console.error('Failed to connect to the database:', error);
  });

app.get('/', (req, res) => {
  console.log('Welcome!');
  res.send('Welcome!');
});

app.listen(process.env.PORT, () => {
  console.log(`App is running on port http://localhost:${serverPort}`);
});
