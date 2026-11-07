
import { Router } from "express";
import {
  registerController,
  loginController,
} from "../controllers/authController.js";

const router = Router();

router.post("/auth/register", registerController);
router.post("/auth/login", loginController);

export default router;
