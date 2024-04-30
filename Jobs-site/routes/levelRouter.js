import { Router } from "express";
const router = Router();
import {
  getAllLevels,
  updateLevel,
  deleteLevel,
  createLevel,
  getLevel,
} from "../controllers/levelController.js";

router.route("/").get(getAllLevels).post(createLevel);

router.route("/:id").get(getLevel).patch(updateLevel).delete(deleteLevel);

export default router;
