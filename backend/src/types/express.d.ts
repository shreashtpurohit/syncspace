import type { WorkspaceRole } from "../middleware/workspaceAuth.js";
import type { Project } from "../repositories/projectRepository.js";
import type { ProjectMember } from "../repositories/projectMembershipsRepository.js";
declare module "express-serve-static-core" {
  interface Request {
    user: {
      id: string;
    };

    workspaceMembership?: {
      id: string;
      workspaceId: string;
      role: WorkspaceRole;
    };
    project?: Project;
projectMembership?: ProjectMember;
  }
}


export {};