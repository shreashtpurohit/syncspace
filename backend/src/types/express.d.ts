import type { WorkspaceRole } from "../middleware/workspaceAuth.js";

declare module "express-serve-static-core" {
  interface Request {
    user: {
      id: string;
    };

    workspaceMembership?: {
      workspaceId: string;
      role: WorkspaceRole;
    };
  }
}

export {};