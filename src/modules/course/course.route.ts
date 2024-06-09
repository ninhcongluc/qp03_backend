import { Router,Request,Response } from "express";
import { authentication,authorization } from "../auth/auth.middleware";
import { CourseService } from "./course.service";
import AppDataSource from "../../configs/connect-db";
import { CourseController } from "./course.controller";
import schemaValidator from "../../middleware/schemaValidator";
const courseRouter = Router();
const courseService = new CourseService(AppDataSource);
const courseController = new CourseController(courseService);

courseRouter.post(
  "/manager/create",
  authentication,
  authorization(["manager"]),
  schemaValidator("/create"),
  (req: Request, res: Response) => {
    return courseController.createCourse(req, res);
  }
);

courseRouter.get("/list", authentication, authorization(["manager, teacher, student"]), (req: Request, res: Response) => {
  return courseController.listCourse(req, res);
});

courseRouter.get("/:id", authentication, authorization(["manager, teacher, student"]), (req: Request, res: Response) => {
  return courseController.getDetailCourse(req, res);
});
