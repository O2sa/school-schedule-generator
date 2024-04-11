import { Router } from "express";
const router = Router();
import {
  getAllSubjects,
  updateSubject,
  deleteSubject,
  createSubject,
  getSubject,
  getClassSubjects,
} from "../controllers/subjectController.js";

router.route("/").get(getAllSubjects).post(createSubject);

router.route("/:id").get(getSubject).patch(updateSubject).delete(deleteSubject);

router.route("/classSubjects/:id").get(getClassSubjects);
export default router;
