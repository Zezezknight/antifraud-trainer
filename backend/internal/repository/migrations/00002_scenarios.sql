-- +goose Up
CREATE TABLE IF NOT EXISTS scenarios (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    role VARCHAR(50) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    required_points INT NOT NULL DEFAULT 0,
    start_node_id INT NULL
);

CREATE TABLE IF NOT EXISTS scenario_nodes (
    id SERIAL PRIMARY KEY,
    scenario_id INT NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    is_final BOOLEAN NOT NULL DEFAULT FALSE,
    final_status VARCHAR(20) NULL
);

ALTER TABLE scenarios
ADD CONSTRAINT fk_scenarios_start_node
FOREIGN KEY (start_node_id) REFERENCES scenario_nodes(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS scenario_options (
    id SERIAL PRIMARY KEY,
    from_node_id INT NOT NULL REFERENCES scenario_nodes(id) ON DELETE CASCADE,
    to_node_id INT NOT NULL REFERENCES scenario_nodes(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    status VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_scenario_results (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scenario_id INT NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    best_score INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, scenario_id)
);

ALTER TABLE users
ADD COLUMN points INT NOT NULL DEFAULT 0,
ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'Новичок';

-- +goose Down
ALTER TABLE users
DROP COLUMN IF EXISTS points,
DROP COLUMN IF EXISTS status;

DROP TABLE IF EXISTS user_scenario_results;

DROP TABLE IF EXISTS scenario_options;

ALTER TABLE scenarios
DROP CONSTRAINT IF EXISTS fk_scenarios_start_node;

DROP TABLE IF EXISTS scenario_nodes;

DROP TABLE IF EXISTS scenarios;
