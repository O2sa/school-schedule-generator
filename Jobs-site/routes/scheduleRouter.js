import { Router } from "express";
const router = Router();
import {
  getAllSchedules,
  getSchedule,
  generateSchedule,
  updateSchedule,
} from "../controllers/scheduleController.js";

router.route("/").get(getAllSchedules);

router.route("/generateSchedule").get(generateSchedule);

router.route("/:id").get(getSchedule).patch(updateSchedule);

export default router;
