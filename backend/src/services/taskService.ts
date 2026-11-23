
import {
  createTask as createTaskRepository,
  getTasksByProject as getTasksByProjectRepository,
  getTaskById as getTaskByIdRepository,
  getTaskAssignees as getTaskAssigneesRepository,
  assignTaskMember as assignTaskMemberRepository,
  removeTaskAssignee as removeTaskAssigneeRepository,
  updateTaskStatus as updateTaskStatusRepository,
  getTaskStatusHistory as getTaskStatusHistoryRepository,
} from "../repositories/taskRepository.js";

import type {
  Task,
  TaskAssignee,
  TaskStatus,
  TaskStatusHistory,
  CreateTaskData,
} from "../repositories/taskRepository.js";

import {
  getProjectMembershipByProjectAndMembership,
} from "../repositories/projectMembershipsRepository.js";

import { AppError } from "../errors/AppError.js";

const TASK_PRIORITIES = [
  "low",
  "medium",
  "high",
  "urgent",
] as const;

const VALID_TASK_STATUSES = [
  "todo",
  "in_progress",
  "done",
] as const;

interface CreateTaskInput extends CreateTaskData {}

export const createTask = async ({
  projectId,
  createdBy,
  title,
  description,
  priority = "medium",
  dueDate,
}: CreateTaskInput): Promise<Task> => {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    throw new AppError("Task title is required", 400);
  }

  if (trimmedTitle.length > 200) {
    throw new AppError(
      "Task title cannot exceed 200 characters",
      400,
    );
  }

  if (
    !TASK_PRIORITIES.includes(
      priority as (typeof TASK_PRIORITIES)[number],
    )
  ) {
    throw new AppError("Invalid task priority", 400);
  }

  if (description && description.length > 5000) {
    throw new AppError(
      "Task description cannot exceed 5000 characters",
      400,
    );
  }

  if (dueDate !== undefined && dueDate !== null) {
    const parsedDate = new Date(dueDate);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new AppError("Invalid task due date", 400);
    }
  }

  return createTaskRepository({
    projectId,
    createdBy,
    title: trimmedTitle,
    ...(description !== undefined
      ? { description: description.trim() }
      : {}),
    priority,
    ...(dueDate !== undefined ? { dueDate } : {}),
  });
};

export const getTasksByProject = async (
  projectId: string,
): Promise<Task[]> => {
  return getTasksByProjectRepository(projectId);
};

export const getTaskById = async (
  taskId: string,
  projectId: string,
): Promise<Task> => {
  const task = await getTaskByIdRepository(taskId, projectId);

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  return task;
};

export const getTaskAssignees = async (
  taskId: string,
  projectId: string,
): Promise<TaskAssignee[]> => {
  await getTaskById(taskId, projectId);

  return getTaskAssigneesRepository(taskId, projectId);
};

export const assignTaskMember = async (
  taskId: string,
  projectId: string,
  membershipId: string,
): Promise<TaskAssignee> => {
  await getTaskById(taskId, projectId);

  const projectMembership =
    await getProjectMembershipByProjectAndMembership(
      projectId,
      membershipId,
    );

  if (!projectMembership) {
    throw new AppError(
      "User is not a member of this project",
      404,
    );
  }

  try {
    await assignTaskMemberRepository(
      taskId,
      projectId,
      membershipId,
    );

    const assignees = await getTaskAssigneesRepository(
      taskId,
      projectId,
    );

    const assignee = assignees.find(
      (item) => item.membership_id === membershipId,
    );

    if (!assignee) {
      throw new Error("Failed to retrieve assigned task member");
    }

    return assignee;
  } catch (error: unknown) {
    if (error instanceof AppError) {
      throw error;
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      "constraint" in error &&
      error.code === "23505" &&
      error.constraint === "unique_task_assignee"
    ) {
      throw new AppError(
        "This user is already assigned to the task",
        409,
      );
    }

    throw error;
  }
};

export const removeTaskAssignee = async (
  taskId: string,
  projectId: string,
  membershipId: string,
): Promise<void> => {
  await getTaskById(taskId, projectId);

  const removed = await removeTaskAssigneeRepository(
    taskId,
    membershipId,
  );

  if (!removed) {
    throw new AppError(
      "Task assignment not found",
      404,
    );
  }
};

export const updateTaskStatus = async (
  taskId: string,
  projectId: string,
  changedBy: string,
  status: TaskStatus,
): Promise<Task> => {
  if (!VALID_TASK_STATUSES.includes(status)) {
    throw new AppError("Invalid task status", 400);
  }

  try {
    return await updateTaskStatusRepository(
      taskId,
      projectId,
      changedBy,
      status,
    );
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message === "Task not found"
    ) {
      throw new AppError("Task not found", 404);
    }

    throw error;
  }
};

export const getTaskStatusHistory = async (
  taskId: string,
  projectId: string,
): Promise<TaskStatusHistory[]> => {
  await getTaskById(taskId, projectId);

  return getTaskStatusHistoryRepository(taskId);
};
