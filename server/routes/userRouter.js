import { Router } from "express";
import {
  getCurrentUser,
  updateUser,
  getAllAdmins,
  getAdmin,
  deleteAdmin,
  updateAdmin,
} from "../controllers/userController.js";
import { validateUpdateUserInput } from "../middleware/validationMiddleware.js";
import {
  authorizePermissions,
  checkForTestUser,
} from "../middleware/authMiddleware.js";
import { addAdmin } from "../controllers/authController.js";

// import upload from '../middleware/multerMiddleware.js';
const router = Router();

router.get("/current-user", getCurrentUser);
router
  .route("/admins")
  .get([authorizePermissions("super-admin"), getAllAdmins])
  .post([authorizePermissions("super-admin"), addAdmin]);
router
  .route("/admins/:id")
  .patch([authorizePermissions("super-admin"), updateAdmin])
  .delete([authorizePermissions("super-admin"), deleteAdmin]);

// router.get("/admins", [
//   authorizePermissions("admin"),
//   getApplicationStats,
// ]);

router.patch(
  "/update-user",
  checkForTestUser,
  // upload.single('avatar'),
  validateUpdateUserInput,
  updateUser
);

export default router;
