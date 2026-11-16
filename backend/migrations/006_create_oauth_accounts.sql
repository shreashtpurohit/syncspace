
-- Up Migration

ALTER TABLE users
ALTER COLUMN password_hash DROP NOT NULL;

CREATE TABLE oauth_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    provider VARCHAR(20) NOT NULL,

    provider_user_id VARCHAR(255) NOT NULL,

    email VARCHAR(255),

    email_verified BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_oauth_provider_identity
        UNIQUE (provider, provider_user_id),

    CONSTRAINT unique_user_oauth_provider
        UNIQUE (user_id, provider),

    CONSTRAINT valid_oauth_provider
        CHECK (provider IN ('google', 'github'))
);

CREATE INDEX idx_oauth_accounts_user_id
ON oauth_accounts(user_id);


-- Down Migration

DROP TABLE oauth_accounts;

ALTER TABLE users
ALTER COLUMN password_hash SET NOT NULL;
