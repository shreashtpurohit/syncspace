import type { Request, Response, NextFunction } from "express";
import pool from "../db/pool.js";

export type WorkspaceRole = "owner" | "admin" | "member";

export const requireWorkspaceRole = (
  ...allowedRoles: WorkspaceRole[]
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user.id;
      const { workspaceId } = req.params;

      if (!workspaceId || Array.isArray(workspaceId)){
        return res.status(400).json({
            message:"Invalid workspace ID"
        });
      }

      const result = await pool.query(
        `
        SELECT role
        FROM memberships
        WHERE user_id = $1
          AND workspace_id = $2
        `,
        [userId, workspaceId]
      );

      if (result.rows.length === 0) {
        return res.status(403).json({
          message: "You do not have access to this workspace",
        });
      }

      const role = result.rows[0].role as WorkspaceRole;

      if (!allowedRoles.includes(role)) {
        return res.status(403).json({
          message: "You do not have permission to perform this action",
        });
      }

      req.workspaceMembership = {
        workspaceId,
        role,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};