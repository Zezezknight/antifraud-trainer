package repository

import (
	"avito-antifraud-trainer/internal/domain"
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5/pgconn"
)

const uniqueViolationCode = "23505"

type UserRepository struct {
	DB *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{DB: db}
}

func (r *UserRepository) CreateUser(ctx context.Context, username string, passwordHash string) (*domain.User, error) {
	const query = `
		INSERT INTO users (username, password_hash)
		VALUES ($1, $2)
		RETURNING id, username, password_hash, points, status, completed_easy_scenarios, completed_hard_scenarios
	`

	var user domain.User
	err := r.DB.QueryRowContext(ctx, query, username, passwordHash).Scan(
		&user.ID, &user.Username, &user.PasswordHash, &user.Points, &user.Status, &user.CompletedEasyScenarios, &user.CompletedHardScenarios,
	)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == uniqueViolationCode {
			return nil, domain.ErrUserAlreadyExists
		}
		return nil, fmt.Errorf("create user: %w", err)
	}

	return &user, nil
}

func (r *UserRepository) GetUserByUsername(ctx context.Context, username string) (*domain.User, error) {
	const query = `
		SELECT id, username, password_hash, points, status, completed_easy_scenarios, completed_hard_scenarios
		FROM users
		WHERE username = $1
	`

	var user domain.User
	err := r.DB.QueryRowContext(ctx, query, username).Scan(
		&user.ID, &user.Username, &user.PasswordHash, &user.Points, &user.Status, &user.CompletedEasyScenarios, &user.CompletedHardScenarios,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, domain.ErrUserNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("get user by username: %w", err)
	}

	return &user, nil
}

func (r *UserRepository) GetUserByID(ctx context.Context, id string) (*domain.User, error) {
	const query = `
		SELECT id, username, password_hash, points, status, completed_easy_scenarios, completed_hard_scenarios
		FROM users
		WHERE id = $1
	`

	var user domain.User
	err := r.DB.QueryRowContext(ctx, query, id).Scan(
		&user.ID, &user.Username, &user.PasswordHash, &user.Points, &user.Status, &user.CompletedEasyScenarios, &user.CompletedHardScenarios,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, domain.ErrUserNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("get user by id: %w", err)
	}

	return &user, nil
}

func (r *UserRepository) UpdateUserStatus(ctx context.Context, id string, status string) error {
	const query = `
		UPDATE users
		SET status = $2
		WHERE id = $1
	`

	res, err := r.DB.ExecContext(ctx, query, id, status)
	if err != nil {
		return fmt.Errorf("update user status: %w", err)
	}

	rows, err := res.RowsAffected()
	if err != nil {
		return fmt.Errorf("update user status: %w", err)
	}
	if rows == 0 {
		return domain.ErrUserNotFound
	}

	return nil
}
