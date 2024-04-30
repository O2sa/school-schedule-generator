import { Router } from "express";
const router = Router();
import {
  getAllTeachers,
  updateTeacher,
  deleteTeacher,
  createTeacher,
  getTeacher,
  getStageTeachers,
} from "../controllers/teacherController.js";
import { validateTeacherIdParam, validateTeacherInput } from "../middleware/validationMiddleware.js";

router.route("/").get(getAllTeachers).post(createTeacher);
router.route("/stage-teachers/:id").get(getStageTeachers);


router
  .route("/:id")
  .get(validateTeacherIdParam,getTeacher)
  .patch(validateTeacherIdParam,validateTeacherInput, updateTeacher)
  .delete(validateTeacherIdParam,deleteTeacher);
export default router;
