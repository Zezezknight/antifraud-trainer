-- +goose Up
ALTER TABLE users
ADD COLUMN completed_easy_scenarios INT NOT NULL DEFAULT 0,
ADD COLUMN completed_hard_scenarios INT NOT NULL DEFAULT 0;

-- +goose Down
ALTER TABLE users
DROP COLUMN IF EXISTS completed_easy_scenarios,
DROP COLUMN IF EXISTS completed_hard_scenarios;
