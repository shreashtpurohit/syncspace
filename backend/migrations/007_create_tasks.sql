
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    project_id UUID NOT NULL
        REFERENCES projects(id)
        ON DELETE CASCADE,

    created_by UUID NOT NULL
        REFERENCES users(id)
        ON DELETE RESTRICT,

    title TEXT NOT NULL,
    description TEXT,

    status TEXT NOT NULL DEFAULT 'todo',
    priority TEXT NOT NULL DEFAULT 'medium',

    due_date TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_task_status
        CHECK (status IN ('todo', 'in_progress', 'done')),

    CONSTRAINT valid_task_priority
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

    CONSTRAINT non_empty_task_title
        CHECK (LENGTH(TRIM(title)) > 0),

    CONSTRAINT unique_task_project_id
        UNIQUE (id, project_id)
);

CREATE TABLE task_assignees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    task_id UUID NOT NULL,
    project_id UUID NOT NULL,
    membership_id UUID NOT NULL,

    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_task_assignee_task
        FOREIGN KEY (task_id, project_id)
        REFERENCES tasks(id, project_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_task_assignee_project_member
        FOREIGN KEY (project_id, membership_id)
        REFERENCES project_memberships(project_id, membership_id)
        ON DELETE CASCADE,

    CONSTRAINT unique_task_assignee
        UNIQUE (task_id, membership_id)
);

CREATE TABLE task_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    task_id UUID NOT NULL
        REFERENCES tasks(id)
        ON DELETE CASCADE,

    changed_by UUID NOT NULL
        REFERENCES users(id)
        ON DELETE RESTRICT,

    previous_status TEXT,
    new_status TEXT NOT NULL,

    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_previous_task_status
        CHECK (
            previous_status IS NULL
            OR previous_status IN ('todo', 'in_progress', 'done')
        ),

    CONSTRAINT valid_new_task_status
        CHECK (new_status IN ('todo', 'in_progress', 'done'))
);

CREATE INDEX idx_tasks_project_id
    ON tasks(project_id);

CREATE INDEX idx_tasks_project_status
    ON tasks(project_id, status);

CREATE INDEX idx_tasks_due_date
    ON tasks(due_date);

CREATE INDEX idx_task_assignees_task_id
    ON task_assignees(task_id);

CREATE INDEX idx_task_assignees_membership_id
    ON task_assignees(membership_id);

CREATE INDEX idx_task_status_history_task_id
    ON task_status_history(task_id);
