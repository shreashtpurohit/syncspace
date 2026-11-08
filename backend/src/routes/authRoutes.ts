
import { Router } from "express";
import {
  registerController,
  loginController,
  getCurrentUserController,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/auth/register", registerController);
router.post("/auth/login", loginController);

router.get(
  "/auth/me",
  authenticate,
  getCurrentUserController
);

export default router;
