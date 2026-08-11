package repository

import (
	"database/sql"
	"embed"
	"fmt"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/pressly/goose/v3"
)

//go:embed migrations/*.sql
var migrationsFS embed.FS

func NewDB(dsn string) (*sql.DB, error) {
	db, err := sql.Open("pgx", dsn)
	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		_ = db.Close()
		return nil, err
	}

	return db, nil
}

func RunMigrations(db *sql.DB) error {
	if err := goose.SetDialect("postgres"); err != nil {
		return fmt.Errorf("failed to set dialect: %w", err)
	}

	goose.SetBaseFS(migrationsFS)

	if err := goose.Up(db, "migrations"); err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	return nil
}
