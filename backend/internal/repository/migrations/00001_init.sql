-- +goose Up
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT uuidv7(),
    username      VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- +goose Down
DROP TABLE users;
