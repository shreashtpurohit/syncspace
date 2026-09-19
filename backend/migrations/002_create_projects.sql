CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    workspace_id UUID NOT NULL
    REFERENCES workspaces(id)
    ON DELETE CASCADE,

    created_by UUID NOT NULL 
    REFERENCES users(id)
    ON DELETE RESTRICT,

    name TEXT NOT NULL,

    description TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_project_name_per_workspace 
    UNIQUE (workspace_id, name)
);