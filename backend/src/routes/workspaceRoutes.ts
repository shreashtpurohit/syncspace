import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { requireWorkspaceRole } from "../middleware/workspaceAuth.js";

const router = Router();

router.get(
  "/workspaces/:workspaceId/test",
  authenticate,
  requireWorkspaceRole("member", "admin", "owner"),
  (req, res) => {
    res.json({
      message: "Workspace access granted",
      userId: req.user.id,
      workspace: req.workspaceMembership,
    });
  }
);

export default router;