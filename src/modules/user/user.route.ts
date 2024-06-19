import { Router, Request, Response } from 'express';
import { authentication, authorization } from '../auth/auth.middleware';
import { UserService } from './user.service';
import AppDataSource from '../../configs/connect-db';
import { UserController } from './user.controller';
import schemaValidator from '../../middleware/schemaValidator';
import multer from 'multer';
import xlsx from 'xlsx';
const userRouter = Router();
const userService = new UserService(AppDataSource);
const userController = new UserController(userService);

// Manager routes
userRouter.post(
  '/manager/create',
  authentication,
  authorization(['admin']),
  schemaValidator('/manager/create'),
  (req: Request, res: Response) => {
    return userController.createManagerAccount(req, res);
  }
);

userRouter.get('/manager/list', authentication, authorization(['admin']), (req: Request, res: Response) => {
  return userController.listManagerAccount(req, res);
});

userRouter.get('/manager/:id', authentication, authorization(['admin']), (req: Request, res: Response) => {
  return userController.getDetailUser(req, res);
});

userRouter.put(
  '/manager/:id',
  authentication,
  authorization(['admin']),
  schemaValidator('/manager/update'),
  (req: Request, res: Response) => {
    return userController.updateManagerAccount(req, res);
  }
);

userRouter.delete('/manager/:id', authentication, authorization(['admin']), (req: Request, res: Response) => {
  return userController.deleteManagerAccount(req, res);
});

userRouter.get('/teacher/list', authentication, (req: Request, res: Response) => {
  return userController.listTeacherAccount(req, res);
});

userRouter.put(
  '/teacher/:id',
  authentication,
  authorization(['manager']),
  schemaValidator('/manager/update'),
  (req: Request, res: Response) => {
    return userController.updateTeacherAccount(req, res);
  }
);

userRouter.delete('/teacher/:id', authentication, authorization(['manager']), (req: Request, res: Response) => {
  return userController.deleteTeacherAccount(req, res);
});

userRouter.get('/teacher/:id', authentication, authorization(['manager', 'teacher']), (req: Request, res: Response) => {
  return userController.getDetailUser(req, res);
});

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Endpoint to handle Excel file upload
userRouter.post('/upload', upload.single('file'), (req, res) => {
  try {
    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    console.log('Data:', data);

    // Process the data (e.g., save to a database)
    console.log(data);

    res.status(200).json({ message: 'File uploaded and processed successfully', data });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ message: 'Error processing file', error });
  }
});

userRouter.get('/student/list', authentication, (req: Request, res: Response) => {
  return userController.listStudentAccount(req, res);
});

//Profile
userRouter.get('/user/profile', authentication, (req: Request, res: Response) => {
  return userController.getUserProfile(req, res);
});

export default userRouter;
