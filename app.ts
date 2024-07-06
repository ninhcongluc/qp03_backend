import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import AppDataSource from './src/configs/connect-db';
import router from './src';
import session from 'express-session'; // <-- Changed this line
const passportSetUp = require('./passport');


const app = express();

const serverPort = process.env.PORT || 8000;
app.use(
  session({
    secret: 'cyberwolve',
    resave: false,
    saveUninitialized: false
  })
);

app.use(
  cors({
    origin: 'http://localhost:3000', // Your frontend origin
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  })
);

app.use(helmet()); // Enable Helmet
app.use(morgan('dev')); // Enable Morgan
app.use(express.json()); // <=== Enable JSON body parser

// use routes
app.use('/', router);

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
