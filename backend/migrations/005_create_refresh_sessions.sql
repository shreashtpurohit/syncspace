-- Up Migration

CREATE TABLE refresh_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

    family_id UUID NOT NULL,

    token_hash CHAR(64) NOT NULL UNIQUE,

    expires_at TIMESTAMPTZ NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    revoked_at TIMESTAMPTZ,

    replaced_by_session_id UUID
    REFERENCES refresh_sessions(id)
    ON DELETE SET NULL,

    CONSTRAINT valid_refresh_session_expiry
    CHECK (expires_at > created_at)
);

CREATE INDEX idx_refresh_sessions_user_id
ON refresh_sessions(user_id);

CREATE INDEX idx_refresh_sessions_family_id
ON refresh_sessions(family_id);

CREATE INDEX idx_refresh_sessions_expires_at
ON refresh_sessions(expires_at);


-- Down Migration

DROP TABLE refresh_sessions;