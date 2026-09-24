import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { requireWorkspaceRole } from "../middleware/workspaceAuth.js";
import { createProjectController, getProjectsByWorkspaceController, } from "../controllers/projectController.js";

const router = Router();



router.get(
  "/workspaces/:workspaceId/projects",
  authenticate,
  requireWorkspaceRole("member", "admin", "owner"),
  getProjectsByWorkspaceController
);

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



router.post(
  "/workspaces/:workspaceId/projects",
  authenticate,
  requireWorkspaceRole("member", "admin", "owner"),
  createProjectController
);

export default router;