import { Router } from "express";
const router = Router();
import {
  getAllSchedules,
  getSchedule,
  generateSchedule,
  updateSchedule,
} from "../controllers/scheduleController.js";

router.route("/").get(getAllSchedules);

router.route("/generate").post(generateSchedule);

router.route("/:id").get(getSchedule).patch(updateSchedule);

export default router;
