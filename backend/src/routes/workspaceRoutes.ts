import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { requireWorkspaceRole } from "../middleware/workspaceAuth.js";
import { createProjectController, getProjectsByWorkspaceController, } from "../controllers/projectController.js";
import { createProjectMembershipController, getProjectMembersController, updateProjectMembershipRoleController, deleteProjectMembershipController, } from "../controllers/projectMembershipController.js";
import { requireProjectRole } from "../middleware/projectAuth.js";
import { requireProjectContext } from "../middleware/projectContext.js";

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

router.post(
  "/workspaces/:workspaceId/projects/:projectId/members",
  authenticate,
  requireWorkspaceRole("admin", "owner"),
  requireProjectContext,
  createProjectMembershipController
)

router.get(
  "/workspaces/:workspaceId/projects/:projectId/members",
  authenticate,
  requireWorkspaceRole("member", "admin", "owner"),
  requireProjectRole("viewer", "editor"),
  getProjectMembersController
);

router.patch(
    "/workspaces/:workspaceId/projects/:projectId/members/:projectMembershipId",
    authenticate,
    requireWorkspaceRole("admin", "owner"),
     requireProjectContext,
    updateProjectMembershipRoleController
);

router.delete(
    "/workspaces/:workspaceId/projects/:projectId/members/:projectMembershipId",
    authenticate,
    requireWorkspaceRole("admin", "owner"),
    requireProjectContext,
    deleteProjectMembershipController
);

export default router;