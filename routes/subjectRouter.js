import { Router } from "express";
const router = Router();
import {
  getAllSubjects,
  updateSubject,
  deleteSubject,
  createSubject,
  getSubject,
  getLevelInfo,
} from "../controllers/subjectController.js";
import { validateSubjectInput } from "../middleware/validationMiddleware.js";

router.route("/").get(getAllSubjects).post(validateSubjectInput,createSubject);

router.route("/:id").get(getSubject).patch(validateSubjectInput,updateSubject).delete(deleteSubject);

router.route("/level-subjects/:id").get(getLevelInfo);
export default router;
