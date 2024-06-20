import { Request, Response, Router } from 'express';
import multer from 'multer';
import path from 'path';
import xlsx from 'xlsx';
import fs from 'fs';
import AppDataSource from '../../configs/connect-db';
import schemaValidator from '../../middleware/schemaValidator';
import { authentication, authorization } from '../auth/auth.middleware';
import { UserController } from './user.controller';
import { UserService } from './user.service';
const userRouter = Router();
const userService = new UserService(AppDataSource);
const userController = new UserController(userService);
import axios from 'axios';

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

// Endpoint to handle Excel file upload
userRouter.post('/teacher/import-student/:classId', upload.single('file'), async (req, res) => {
  const classId = req.params.classId;
  try {
    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    console.log('Data:', data);

    // Process the data (e.g., save to a database)
    await userController.importStudent(data, classId);

    res.status(200).json({ message: 'File uploaded and processed successfully', data });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ message: 'Error processing file', error });
  }
});

userRouter.get('/student/:classId', (req: Request, res: Response) => {
  return userController.listStudentInClass(req, res);
});

//Profile
userRouter.get('/user/profile', authentication, (req: Request, res: Response) => {
  return userController.getUserProfile(req, res);
});

userRouter.get('/user/profile', authentication, async (req: Request, res: Response) => {
  try {
    // Call the /api/profile endpoint to fetch the user's name
    const response = await axios.get('/api/profile');
    const userName = response.data.name;

    // Pass the user's name to the getUserProfile method
    const { firstName, lastName, error } = await userController.getUserProfile(req, res, userName);
    if (error) {
      return res.status(500).json({ error });
    }
    return res.status(200).json({ firstName, lastName });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default userRouter;
