package repository

import (
	"avito-antifraud-trainer/internal/domain"
	"context"
	"database/sql"
	"errors"
	"fmt"
)

type ScenarioRepository struct {
	DB *sql.DB
}

func NewScenarioRepository(db *sql.DB) *ScenarioRepository {
	return &ScenarioRepository{DB: db}
}

func (r *ScenarioRepository) GetScenarios(ctx context.Context, role string) ([]*domain.Scenario, error) {
	const query = `
		SELECT id, title, description, role, difficulty, required_points, start_node_id
		FROM scenarios
		WHERE role = $1
		ORDER BY id
	`

	rows, err := r.DB.QueryContext(ctx, query, role)
	if err != nil {
		return nil, fmt.Errorf("get scenarios: %w", err)
	}
	defer rows.Close()

	var scenarios []*domain.Scenario
	for rows.Next() {
		var s domain.Scenario
		var startNodeID sql.NullInt64

		if err := rows.Scan(
			&s.ID, &s.Title, &s.Description, &s.Role, &s.Difficulty, &s.RequiredPoints, &startNodeID,
		); err != nil {
			return nil, fmt.Errorf("scan scenario: %w", err)
		}

		if startNodeID.Valid {
			s.StartNodeID = int(startNodeID.Int64)
		}

		scenarios = append(scenarios, &s)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("get scenarios: %w", err)
	}

	return scenarios, nil
}

func (r *ScenarioRepository) GetScenarioByID(ctx context.Context, scenarioID int) (*domain.Scenario, error) {
	const query = `
		SELECT id, title, description, role, difficulty, required_points, start_node_id
		FROM scenarios
		WHERE id = $1
	`

	var s domain.Scenario
	var startNodeID sql.NullInt64

	err := r.DB.QueryRowContext(ctx, query, scenarioID).Scan(
		&s.ID, &s.Title, &s.Description, &s.Role, &s.Difficulty, &s.RequiredPoints, &startNodeID,
	)

	if errors.Is(err, sql.ErrNoRows) {
		return nil, domain.ErrScenarioNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("get scenario by id: %w", err)
	}

	if startNodeID.Valid {
		s.StartNodeID = int(startNodeID.Int64)
	}

	return &s, nil
}

func (r *ScenarioRepository) GetNodeByID(ctx context.Context, nodeID int) (*domain.ScenarioNode, error) {
	const query = `
		SELECT id, scenario_id, message_text, is_final, final_status
		FROM scenario_nodes
		WHERE id = $1
	`

	var node domain.ScenarioNode
	var finalStatus sql.NullString

	err := r.DB.QueryRowContext(ctx, query, nodeID).Scan(
		&node.ID, &node.ScenarioID, &node.MessageText, &node.IsFinal, &finalStatus,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, domain.ErrScenarioNodeNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("get node by id: %w", err)
	}

	if finalStatus.Valid {
		status := domain.Status(finalStatus.String)
		node.FinalStatus = &status
	}

	return &node, nil
}

func (r *ScenarioRepository) GetOptionsForNode(ctx context.Context, nodeID int) ([]*domain.ScenarioOption, error) {
	const query = `
		SELECT id, from_node_id, to_node_id, message_text, status
		FROM scenario_options
		WHERE from_node_id = $1
		ORDER BY id
	`

	rows, err := r.DB.QueryContext(ctx, query, nodeID)
	if err != nil {
		return nil, fmt.Errorf("get options for node: %w", err)
	}
	defer rows.Close()

	var options []*domain.ScenarioOption
	for rows.Next() {
		var o domain.ScenarioOption
		if err := rows.Scan(&o.ID, &o.FromNodeID, &o.ToNodeID, &o.MessageText, &o.Status); err != nil {
			return nil, fmt.Errorf("scan scenario option: %w", err)
		}
		options = append(options, &o)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("get options for node: %w", err)
	}

	return options, nil
}

func (r *ScenarioRepository) GetOptionByID(ctx context.Context, optionID int) (*domain.ScenarioOption, error) {
	const query = `
		SELECT id, from_node_id, to_node_id, message_text, status
		FROM scenario_options
		WHERE id = $1
	`

	var option domain.ScenarioOption
	err := r.DB.QueryRowContext(ctx, query, optionID).Scan(
		&option.ID, &option.FromNodeID, &option.ToNodeID, &option.MessageText, &option.Status,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, domain.ErrScenarioOptionNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("get option by id: %w", err)
	}

	return &option, nil
}

func (r *ScenarioRepository) GetScenarioResult(ctx context.Context, userID string, scenarioID int) (*domain.UserScenarioResult, error) {
	// получает лучший результат пользователя для конкретного сценария
	// если такого нет, то nil
	panic("implement me")
}

// добавить пересчет кол-ва пройденных (status = "green") сценариев (уникальных), то есть 2 успешных прохождения одного и того же сценария считаются как 1 прохождение
func (r *ScenarioRepository) SaveScenarioResult(ctx context.Context, userID string, scenarioID int, score int, status string, difficulty string) error {
	tx, err := r.DB.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("save scenario result: %w", err)
	}
	defer tx.Rollback()

	const upsertQuery = `
		INSERT INTO user_scenario_results (user_id, scenario_id, best_score, status, completed_at)
		VALUES ($1, $2, $3, $4, NOW())
		ON CONFLICT (user_id, scenario_id) DO UPDATE
		SET best_score   = EXCLUDED.best_score,
		    status       = EXCLUDED.status,
		    completed_at = EXCLUDED.completed_at
		WHERE user_scenario_results.best_score < EXCLUDED.best_score
	`

	if _, err := tx.ExecContext(ctx, upsertQuery, userID, scenarioID, score, string(status)); err != nil {
		return fmt.Errorf("save scenario result: %w", err)
	}

	const recalcPointsQuery = `
		UPDATE users
		SET points = (
			SELECT COALESCE(SUM(best_score), 0)
			FROM user_scenario_results
			WHERE user_id = $1
		)
		WHERE id = $1
	`

	if _, err := tx.ExecContext(ctx, recalcPointsQuery, userID); err != nil {
		return fmt.Errorf("recalc user points: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("save scenario result: %w", err)
	}

	return nil
}

func (r *ScenarioRepository) GetLeaderBoard(ctx context.Context, userID string) ([]*domain.LeaderboardEntry, error) {
	const query = `
		WITH ranked AS (
			SELECT id, username, points, status,
			       DENSE_RANK() OVER (ORDER BY points DESC) AS rank
			FROM users
		)
		SELECT rank, id, username, points, status
		FROM ranked
		WHERE rank <= 3
		UNION ALL
		SELECT rank, id, username, points, status
		FROM ranked
		WHERE id = $1 AND rank > 3
		ORDER BY rank
	`

	rows, err := r.DB.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("get leaderboard: %w", err)
	}
	defer rows.Close()

	var entries []*domain.LeaderboardEntry
	for rows.Next() {
		var e domain.LeaderboardEntry
		if err := rows.Scan(&e.Rank, &e.UserID, &e.Username, &e.Points, &e.Status); err != nil {
			return nil, fmt.Errorf("scan leaderboard entry: %w", err)
		}
		entries = append(entries, &e)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("get leaderboard: %w", err)
	}

	return entries, nil
}
