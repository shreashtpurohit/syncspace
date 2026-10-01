CREATE TABLE project_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    project_id UUID NOT NULL
    REFERENCES projects(id)
    ON DELETE CASCADE,

    membership_id UUID NOT NULL
    REFERENCES memberships(id)
    ON DELETE CASCADE,

    role TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_project_membership
    UNIQUE (project_id, membership_id),

    CONSTRAINT valid_project_role
    CHECK (role IN ('viewer', 'editor'))
);

CREATE INDEX idx_project_membership_project_id
ON project_memberships(project_id);

CREATE INDEX idx_project_memberships
ON project_memberships(membership_id);