import { Router } from "express";
const router = Router();
import {
  getAllTeachers,
  updateTeacher,
  deleteTeacher,
  createTeacher,
  getTeacher,
} from "../controllers/teacherController.js";

router.route("/").get(getAllTeachers).post(createTeacher);


router.route("/:id").get(getTeacher).patch(updateTeacher).delete(deleteTeacher);
export default router;
