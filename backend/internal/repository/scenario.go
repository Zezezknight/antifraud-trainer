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
		SELECT id, title, description, icon, role, difficulty, required_scenarios_this_level, start_node_id
		FROM scenarios
		WHERE role = $1
		ORDER BY id
	`

	rows, err := r.DB.QueryContext(ctx, query, role)
	if err != nil {
		return nil, fmt.Errorf("select scenarios: %w", err)
	}
	defer func() {
		_ = rows.Close()
	}()

	var scenarios []*domain.Scenario
	for rows.Next() {
		var s domain.Scenario
		var startNodeID sql.NullInt64

		if err := rows.Scan(
			&s.ID, &s.Title, &s.Description, &s.Icon, &s.Role, &s.Difficulty, &s.RequiredScenariosThisLevel, &startNodeID,
		); err != nil {
			return nil, fmt.Errorf("scan scenario: %w", err)
		}

		if startNodeID.Valid {
			s.StartNodeID = int(startNodeID.Int64)
		}

		scenarios = append(scenarios, &s)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("select scenarios: %w", err)
	}

	return scenarios, nil
}

func (r *ScenarioRepository) GetScenarioByID(ctx context.Context, scenarioID int) (*domain.Scenario, error) {
	const query = `
		SELECT id, title, description, icon, role, difficulty, required_scenarios_this_level, start_node_id
		FROM scenarios
		WHERE id = $1
	`

	var s domain.Scenario
	var startNodeID sql.NullInt64

	err := r.DB.QueryRowContext(ctx, query, scenarioID).Scan(
		&s.ID, &s.Title, &s.Description, &s.Icon, &s.Role, &s.Difficulty, &s.RequiredScenariosThisLevel, &startNodeID,
	)

	if errors.Is(err, sql.ErrNoRows) {
		return nil, domain.ErrScenarioNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("select scenario by id: %w", err)
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
		return nil, fmt.Errorf("select node by id: %w", err)
	}

	if finalStatus.Valid {
		status := domain.Status(finalStatus.String)
		node.FinalStatus = &status
	}

	return &node, nil
}

func (r *ScenarioRepository) GetOptionsForNode(ctx context.Context, nodeID int) ([]*domain.ScenarioOption, error) {
	const query = `
		SELECT id, from_node_id, to_node_id, message_text, feedback_text, how_to_recognize_in_life, status
		FROM scenario_options
		WHERE from_node_id = $1
		ORDER BY id
	`

	rows, err := r.DB.QueryContext(ctx, query, nodeID)
	if err != nil {
		return nil, fmt.Errorf("select options: %w", err)
	}
	defer func() {
		_ = rows.Close()
	}()

	var options []*domain.ScenarioOption
	for rows.Next() {
		var o domain.ScenarioOption
		if err := rows.Scan(
			&o.ID, &o.FromNodeID, &o.ToNodeID, &o.MessageText, &o.FeedbackText, &o.HowToRecognizeInLife, &o.Status,
		); err != nil {
			return nil, fmt.Errorf("scan option: %w", err)
		}
		options = append(options, &o)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("select options: %w", err)
	}

	return options, nil
}

func (r *ScenarioRepository) GetOptionByID(ctx context.Context, optionID int) (*domain.ScenarioOption, error) {
	const query = `
		SELECT id, from_node_id, to_node_id, message_text, feedback_text, how_to_recognize_in_life, status
		FROM scenario_options
		WHERE id = $1
	`

	var option domain.ScenarioOption
	err := r.DB.QueryRowContext(ctx, query, optionID).Scan(
		&option.ID, &option.FromNodeID, &option.ToNodeID, &option.MessageText, &option.FeedbackText, &option.HowToRecognizeInLife, &option.Status,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, domain.ErrScenarioOptionNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("select option by id: %w", err)
	}

	return &option, nil
}

func (r *ScenarioRepository) GetScenarioResult(ctx context.Context, userID string, scenarioID int) (*domain.UserScenarioResult, error) {
	const query = `
       SELECT user_id, scenario_id, score, difficulty, status
       FROM user_scenario_results
       WHERE user_id = $1 AND scenario_id = $2
       ORDER BY score DESC
       LIMIT 1
    `

	var result domain.UserScenarioResult
	err := r.DB.QueryRowContext(ctx, query, userID, scenarioID).Scan(
		&result.UserID,
		&result.ScenarioID,
		&result.Score,
		&result.Difficulty,
		&result.Status,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("select scenario result: %w", err)
	}

	return &result, nil
}

func (r *ScenarioRepository) SaveScenarioResult(ctx context.Context, userID string, scenarioID int, score int, status string, difficulty string) error {
	tx, err := r.DB.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("insert scenario result: %w", err)
	}
	defer func() {
		_ = tx.Rollback()
	}()

	const upsertQuery = `
       INSERT INTO user_scenario_results (user_id, scenario_id, score, difficulty, status, completed_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (user_id, scenario_id) DO UPDATE
       SET score        = EXCLUDED.score,
           difficulty   = EXCLUDED.difficulty,
           status       = EXCLUDED.status,
           completed_at = EXCLUDED.completed_at
       WHERE user_scenario_results.score < EXCLUDED.score
    `

	if _, err := tx.ExecContext(ctx, upsertQuery, userID, scenarioID, score, difficulty, status); err != nil {
		return fmt.Errorf("insert scenario result: %w", err)
	}

	const recalcStatsQuery = `
       UPDATE users
       SET points = (
          SELECT COALESCE(SUM(score), 0)
          FROM user_scenario_results
          WHERE user_id = $1
       ),
       completed_easy_scenarios = (
          SELECT COUNT(DISTINCT scenario_id)
          FROM user_scenario_results
          WHERE user_id = $1 AND status = $2 AND difficulty = $3
       ),
       completed_hard_scenarios = (
          SELECT COUNT(DISTINCT scenario_id)
          FROM user_scenario_results
          WHERE user_id = $1 AND status = $2 AND difficulty = $4
       )
       WHERE id = $1
    `

	if _, err := tx.ExecContext(
		ctx, recalcStatsQuery, userID,
		string(domain.StatusGreen), string(domain.DifficultyEasy), string(domain.DifficultyHard),
	); err != nil {
		return fmt.Errorf("update user stats: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("insert scenario result: %w", err)
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
		return nil, fmt.Errorf("select leaderboard: %w", err)
	}
	defer func() {
		_ = rows.Close()
	}()

	var entries []*domain.LeaderboardEntry
	for rows.Next() {
		var e domain.LeaderboardEntry
		if err := rows.Scan(&e.Rank, &e.UserID, &e.Username, &e.Points, &e.Status); err != nil {
			return nil, fmt.Errorf("scan leaderboard entry: %w", err)
		}
		entries = append(entries, &e)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("select leaderboard: %w", err)
	}

	return entries, nil
}
