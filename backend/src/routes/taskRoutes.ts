
import { Router } from "express";

import { authenticate } from "../middleware/auth.js";
import { requireWorkspaceRole } from "../middleware/workspaceAuth.js";
import { requireProjectRole } from "../middleware/projectAuth.js";

import {
  createTaskController,
  getTasksByProjectController,
  getTaskByIdController,
  getTaskAssigneesController,
  assignTaskMemberController,
  removeTaskAssigneeController,
} from "../controllers/taskController.js";

const router = Router();

const workspaceAccess = requireWorkspaceRole(
  "member",
  "admin",
  "owner",
);

// List tasks
router.get(
  "/workspaces/:workspaceId/projects/:projectId/tasks",
  authenticate,
  workspaceAccess,
  requireProjectRole("viewer", "editor"),
  getTasksByProjectController,
);

// Create task
router.post(
  "/workspaces/:workspaceId/projects/:projectId/tasks",
  authenticate,
  workspaceAccess,
  requireProjectRole("editor"),
  createTaskController,
);

// Get individual task
router.get(
  "/workspaces/:workspaceId/projects/:projectId/tasks/:taskId",
  authenticate,
  workspaceAccess,
  requireProjectRole("viewer", "editor"),
  getTaskByIdController,
);

// Get task assignees
router.get(
  "/workspaces/:workspaceId/projects/:projectId/tasks/:taskId/assignees",
  authenticate,
  workspaceAccess,
  requireProjectRole("viewer", "editor"),
  getTaskAssigneesController,
);

// Assign project member to task
router.post(
  "/workspaces/:workspaceId/projects/:projectId/tasks/:taskId/assignees",
  authenticate,
  workspaceAccess,
  requireProjectRole("editor"),
  assignTaskMemberController,
);

// Remove task assignee
router.delete(
  "/workspaces/:workspaceId/projects/:projectId/tasks/:taskId/assignees/:membershipId",
  authenticate,
  workspaceAccess,
  requireProjectRole("editor"),
  removeTaskAssigneeController,
);

export default router;
