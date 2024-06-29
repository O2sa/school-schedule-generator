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
import { validateTeacherIdParam, validateTeacherInput, validateTeacherOffLectures } from "../middleware/validationMiddleware.js";

router.route("/").get(getAllTeachers).post(createTeacher);
router.route("/stage-teachers/:id").get(getStageTeachers);


router
  .route("/:id")
  .get(validateTeacherIdParam,getTeacher)
  .patch(validateTeacherIdParam,validateTeacherInput, updateTeacher)
  .delete(validateTeacherIdParam,deleteTeacher);

  router
  .route("/edit-offlectures/:id")
  .patch(validateTeacherIdParam,validateTeacherOffLectures, updateTeacher)
export default router;
