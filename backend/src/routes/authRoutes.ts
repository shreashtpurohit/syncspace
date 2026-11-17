
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
import { googleOAuthLinkCallbackController } from "../controllers/googleOAuthLinkController.js";
import { getLinkedOAuthAccountsController } from "../controllers/oauthAccountController.js";
import { authenticateWithRefresh } from "../middleware/auth.js";

const router = Router();

router.post("/auth/register", registerController);
router.post("/auth/login", loginController);
router.post("/auth/refresh", refreshController);
router.post("/auth/logout", logoutController);

router.get("/auth/me", authenticate, getCurrentUserController);

router.get(
  "/auth/accounts",
  authenticate,
  getLinkedOAuthAccountsController,
);

// Google OAuth login
router.get("/auth/google", startOAuthController("google"));
router.get("/auth/google/callback", googleOAuthCallbackController);

// Google account linking
router.get(
  "/auth/google/link",
  authenticate,
  startOAuthController("google", "link"),
);

router.get(
  "/auth/google/link/callback",
  authenticateWithRefresh,
  googleOAuthLinkCallbackController,
);

export default router;
