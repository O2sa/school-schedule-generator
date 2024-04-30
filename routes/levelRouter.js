import { Router } from "express";
const router = Router();
import {
  getAllLevels,
  updateLevel,
  deleteLevel,
  createLevel,
  getLevel,
} from "../controllers/levelController.js";
import { validateLevelInput } from "../middleware/validationMiddleware.js";

router.route("/").get(getAllLevels).post(createLevel);

router.route("/:id").get(getLevel).patch(validateLevelInput,updateLevel).delete(validateLevelInput,deleteLevel);

export default router;
