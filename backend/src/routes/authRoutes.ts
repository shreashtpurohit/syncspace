
import { Router } from "express";
import {
  registerController,
  loginController,
  getCurrentUserController,
  refreshController,
  logoutController,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { startOAuthController } from "../controllers/oauthAuthorizationController.js";
import { googleOAuthCallbackController } from "../controllers/googleOAuthController.js";

const router = Router();

router.post("/auth/register", registerController);
router.post("/auth/login", loginController);
router.post("/auth/refresh", refreshController);
router.post("/auth/logout", logoutController);

router.get("/auth/me", authenticate, getCurrentUserController);

// Google OAuth
router.get("/auth/google", startOAuthController("google"));
router.get("/auth/google/callback", googleOAuthCallbackController);

export default router;
