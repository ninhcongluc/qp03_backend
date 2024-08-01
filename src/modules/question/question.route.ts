import { Router, Request, Response } from 'express';
import { authentication, authorization } from '../auth/auth.middleware';
import AppDataSource from '../../configs/connect-db';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
const questionRouter = Router();
const questionService = new QuestionService(AppDataSource);
const questionController = new QuestionController(questionService);
import multer from 'multer';
import path from 'path';
import xlsx from 'xlsx';
import fs from 'fs';

questionRouter.post(
  '/question/create',
  authentication,
  authorization(['teacher']),
  (req: Request, res: Response) => {
    return questionController.createQuestion(req, res);
  }
);

questionRouter.get('/question/:teacherId', (req: Request, res: Response) => {
  return questionController.listQuestion(req, res);
});

questionRouter.get('/question/:questionId', (req: Request, res: Response) => {
  return questionController.detailQuestion(req, res);
});

questionRouter.put('/question/:id', (req: Request, res: Response) => {
  return questionController.updateQuestion(req, res);
});

questionRouter.delete('/question/:id', (req: Request, res: Response) => {
  return questionController.deleteQuestion(req, res);
});

const uploadDir = path.join('src', 'uploads');

// Set up multer for file uploads
fs.promises.mkdir(uploadDir, { recursive: true }).catch(console.error);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    const fullPath = path.join(uploadDir, filename);
    console.log(`File will be stored at: ${fullPath}`);
    cb(null, filename);
  }
});
const upload = multer({ storage });

//import question and answer by excel
questionRouter.post(
  '/question/import/:teacherId',
  upload.single('file'),
  (req: Request, res: Response) => {
    return questionController.importQuestion(req, res);
  });

// export question and answer by excel
questionRouter.post('/question/export/:teacherId', (req: Request, res: Response) => {
  return questionController.exportQuestion(req, res);
});


export default questionRouter;
