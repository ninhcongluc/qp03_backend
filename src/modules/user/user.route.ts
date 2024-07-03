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

userRouter.put('/user/change-password', (req: Request, res: Response) => {
  return userController.changePassword(req, res);
});

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

//teacher routes
userRouter.post(
  '/teacher/create',
  authentication,
  authorization(['manager']),
  schemaValidator('/manager/create'),
  (req: Request, res: Response) => {
    return userController.createTeacherAccount(req, res);
  }
);

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

userRouter.get('/teacher-details/:id', authentication, authorization(['manager', 'teacher']), (req: Request, res: Response) => {
  return userController.getTeacherDetails(req, res);
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

//Update Profile
userRouter.put('/profile/updateProfile/:id', authentication, (req: Request, res: Response) => {
  return userController.updateUserProfile(req, res);
});
// Endpoint to handle Excel file upload
userRouter.post('/teacher/import-student/:classId', upload.single('file'), async (req, res) => {
  const classId = req.params.classId;
  try {
    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    // fs.promises.unlink(filePath).catch(console.error);

    console.log('Data:', data);

    // Process the data (e.g., save to a database)
    await userController.importStudent(data, classId);

    res.status(200).json({ message: 'File uploaded and processed successfully', data });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ message: 'Error processing file', error });
  }
});

userRouter.post('/manager/import-teacher', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath, {cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    await fs.promises.unlink(filePath).catch(console.error);

    console.log('Data:', data);
    // Process the data (e.g., save to a database)
    await userController.importTeacher(data);

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

export default userRouter;
