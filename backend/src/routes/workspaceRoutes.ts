import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { requireWorkspaceRole } from "../middleware/workspaceAuth.js";
import { createProjectController, getProjectsByWorkspaceController, } from "../controllers/projectController.js";
import { createProjectMembershipController, getProjectMembersController, updateProjectMembershipRoleController, deleteProjectMembershipController, } from "../controllers/projectMembershipController.js";
import { requireProjectRole } from "../middleware/projectAuth.js";
import { requireProjectContext } from "../middleware/projectContext.js";
import { getUserWorkspacesController } from "../controllers/workspaceController.js";
import { createWorkspaceController } from "../controllers/workspaceController.js";

const router = Router();

router.get(
  "/workspaces",
  authenticate,
  getUserWorkspacesController
);

router.post(
  "/workspaces",
  authenticate,
  createWorkspaceController
);

router.get(
  "/workspaces/:workspaceId/projects",
  authenticate,
  requireWorkspaceRole("member", "admin", "owner"),
  getProjectsByWorkspaceController
);

router.post(
  "/workspaces/:workspaceId/projects",
  authenticate,
  requireWorkspaceRole("admin", "owner"),
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