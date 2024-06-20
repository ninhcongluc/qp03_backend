import { Router, Request, Response } from "express";
import { authentication, authorization } from "../auth/auth.middleware";
import { ClassService } from "./class.service";
import AppDataSource from "../../configs/connect-db";
import { ClassController } from "./class.controller";

const classRouter = Router();
const classService = new ClassService(AppDataSource);
const classController = new ClassController(classService);

classRouter.get('/listClassForTeacher/:teacherId', 
    authentication,
    authorization(["teacher"]),
    (req: Request, res: Response) => {
        return classController.listClassForTeacher(req, res);
    });

export default classRouter;