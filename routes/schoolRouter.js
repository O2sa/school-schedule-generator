import { Router } from "express";
const router = Router();
import {
  getAllSchools,
  updateSchool,
  createSchool,
  getSchool,
  setupData,
  deleteSchool,
} from "../controllers/schoolController.js";
import { authorizePermissions } from "../middleware/authMiddleware.js";

router.route("/").get(getSchool).patch(updateSchool);

router.route("/loadData").post(setupData);

router;

// .route("/:id",
// //  authorizePermissions("admin", "super-admin")
// )
// .delete(deleteSchool);

export default router;
