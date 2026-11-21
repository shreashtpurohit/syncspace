
import pool from "../db/pool.js";

export type TaskStatus = "todo" | "in_progress" | "done";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  project_id: string;
  created_by: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTaskData {
  projectId: string;
  createdBy: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export const createTask = async ({
  projectId,
  createdBy,
  title,
  description,
  priority = "medium",
  dueDate,
}: CreateTaskData): Promise<Task> => {
  const result = await pool.query<Task>(
    `
      INSERT INTO tasks (
        project_id,
        created_by,
        title,
        description,
        priority,
        due_date
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        project_id,
        created_by,
        title,
        description,
        status,
        priority,
        due_date,
        created_at,
        updated_at
    `,
    [
      projectId,
      createdBy,
      title,
      description ?? null,
      priority,
      dueDate ?? null,
    ],
  );

  const task = result.rows[0];

if (!task) {
  throw new Error("Failed to create task");
}

return task;
};

export const getTasksByProject = async (
  projectId: string,
): Promise<Task[]> => {
  const result = await pool.query<Task>(
    `
      SELECT
        id,
        project_id,
        created_by,
        title,
        description,
        status,
        priority,
        due_date,
        created_at,
        updated_at
      FROM tasks
      WHERE project_id = $1
      ORDER BY created_at DESC
    `,
    [projectId],
  );

  return result.rows;
};

export const getTaskById = async (
  taskId: string,
  projectId: string,
): Promise<Task | null> => {
  const result = await pool.query<Task>(
    `
      SELECT
        id,
        project_id,
        created_by,
        title,
        description,
        status,
        priority,
        due_date,
        created_at,
        updated_at
      FROM tasks
      WHERE id = $1
        AND project_id = $2
    `,
    [taskId, projectId],
  );

  return result.rows[0] ?? null;
};

export interface TaskAssignee {
  id: string;
  task_id: string;
  project_id: string;
  membership_id: string;
  assigned_at: Date;
  user_id: string;
  user_name: string;
  user_email: string;
}

export const getTaskAssignees = async (
  taskId: string,
  projectId: string,
): Promise<TaskAssignee[]> => {
  const result = await pool.query<TaskAssignee>(
    `
      SELECT
        ta.id,
        ta.task_id,
        ta.project_id,
        ta.membership_id,
        ta.assigned_at,
        m.user_id,
        u.name AS user_name,
        u.email AS user_email
      FROM task_assignees ta
      JOIN memberships m
        ON m.id = ta.membership_id
      JOIN users u
        ON u.id = m.user_id
      WHERE ta.task_id = $1
        AND ta.project_id = $2
      ORDER BY ta.assigned_at ASC
    `,
    [taskId, projectId],
  );

  return result.rows;
};

export const assignTaskMember = async (
  taskId: string,
  projectId: string,
  membershipId: string,
): Promise<TaskAssignee> => {
  const result = await pool.query<TaskAssignee>(
    `
      INSERT INTO task_assignees (
        task_id,
        project_id,
        membership_id
      )
      VALUES ($1, $2, $3)
      RETURNING
        id,
        task_id,
        project_id,
        membership_id,
        assigned_at,
        NULL::UUID AS user_id,
        NULL::TEXT AS user_name,
        NULL::TEXT AS user_email
    `,
    [taskId, projectId, membershipId],
  );

  const assignee = result.rows[0];

  if (!assignee) {
    throw new Error("Failed to assign task member");
  }

  return assignee;
};

export const removeTaskAssignee = async (
  taskId: string,
  membershipId: string,
): Promise<boolean> => {
  const result = await pool.query(
    `
      DELETE FROM task_assignees
      WHERE task_id = $1
        AND membership_id = $2
      RETURNING id
    `,
    [taskId, membershipId],
  );

  return result.rowCount !== null && result.rowCount > 0;
};
