
import type { Request, Response, NextFunction } from "express";

import {
  createTask,
  getTasksByProject,
  getTaskById,
  getTaskAssignees,
  assignTaskMember,
  removeTaskAssignee,
} from "../services/taskService.js";

import type { TaskPriority } from "../repositories/taskRepository.js";

const TASK_PRIORITIES: TaskPriority[] = [
  "low",
  "medium",
  "high",
  "urgent",
];

const getProjectParams = (req: Request) => {
  const { workspaceId, projectId } = req.params;

  if (
    typeof workspaceId !== "string" ||
    typeof projectId !== "string"
  ) {
    return null;
  }

  return { workspaceId, projectId };
};

export const createTaskController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const params = getProjectParams(req);

    if (!params) {
      return res.status(400).json({
        message: "Invalid workspace or project ID",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const { title, description, priority, dueDate } = req.body;

    if (typeof title !== "string") {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    if (
      description !== undefined &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        message: "Task description must be a string",
      });
    }

    if (
      priority !== undefined &&
      !TASK_PRIORITIES.includes(priority)
    ) {
      return res.status(400).json({
        message: "Invalid task priority",
      });
    }

    if (
      dueDate !== undefined &&
      dueDate !== null &&
      typeof dueDate !== "string"
    ) {
      return res.status(400).json({
        message: "Invalid task due date",
      });
    }

    const task = await createTask({
      projectId: params.projectId,
      createdBy: req.user.id,
      title,
      ...(description !== undefined ? { description } : {}),
      ...(priority !== undefined ? { priority } : {}),
      ...(dueDate !== undefined ? { dueDate } : {}),
    });

    return res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
};

export const getTasksByProjectController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const params = getProjectParams(req);

    if (!params) {
      return res.status(400).json({
        message: "Invalid workspace or project ID",
      });
    }

    const tasks = await getTasksByProject(params.projectId);

    return res.status(200).json({ tasks });
  } catch (error) {
    next(error);
  }
};

export const getTaskByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const params = getProjectParams(req);
    const { taskId } = req.params;

    if (!params || typeof taskId !== "string") {
      return res.status(400).json({
        message: "Invalid workspace, project, or task ID",
      });
    }

    const task = await getTaskById(
      taskId,
      params.projectId,
    );

    return res.status(200).json({ task });
  } catch (error) {
    next(error);
  }
};

export const getTaskAssigneesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const params = getProjectParams(req);
    const { taskId } = req.params;

    if (!params || typeof taskId !== "string") {
      return res.status(400).json({
        message: "Invalid workspace, project, or task ID",
      });
    }

    const assignees = await getTaskAssignees(
      taskId,
      params.projectId,
    );

    return res.status(200).json({ assignees });
  } catch (error) {
    next(error);
  }
};

export const assignTaskMemberController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const params = getProjectParams(req);
    const { taskId } = req.params;
    const { membershipId } = req.body;

    if (!params || typeof taskId !== "string") {
      return res.status(400).json({
        message: "Invalid workspace, project, or task ID",
      });
    }

    if (typeof membershipId !== "string") {
      return res.status(400).json({
        message: "Project membership ID is required",
      });
    }

    const assignee = await assignTaskMember(
      taskId,
      params.projectId,
      membershipId,
    );

    return res.status(201).json({ assignee });
  } catch (error) {
    next(error);
  }
};

export const removeTaskAssigneeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const params = getProjectParams(req);
    const { taskId, membershipId } = req.params;

    if (
      !params ||
      typeof taskId !== "string" ||
      typeof membershipId !== "string"
    ) {
      return res.status(400).json({
        message: "Invalid task or membership ID",
      });
    }

    await removeTaskAssignee(
      taskId,
      params.projectId,
      membershipId,
    );

    return res.status(200).json({
      message: "Task assignee removed successfully",
    });
  } catch (error) {
    next(error);
  }
};
