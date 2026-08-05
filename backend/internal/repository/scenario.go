package repository

import (
	"avito-antifraud-trainer/internal/domain"
	"context"
	"database/sql"
)

type ScenarioRepository struct {
	DB *sql.DB
}

func NewScenarioRepository(db *sql.DB) *ScenarioRepository {
	return &ScenarioRepository{DB: db}
}

func (r *ScenarioRepository) GetScenarios(ctx context.Context, role string) ([]*domain.Scenario, error) {
	// должен возвращать все сценарии с указанной ролью
	panic("implement me")
}

func (r *ScenarioRepository) GetNodeByID(ctx context.Context, nodeID int) (*domain.ScenarioNode, error) {
	// достает узел по его айди
	panic("implement me")
}

func (r *ScenarioRepository) GetOptionsForNode(ctx context.Context, nodeID int) ([]*domain.ScenarioOption, error) {
	// достает варианты ответа для конкретного узла, если они есть
	panic("implement me")
}

func (r *ScenarioRepository) GetOptionByID(ctx context.Context, optionID int) (*domain.ScenarioOption, error) {
	// получает следующий узел согласно выбранной опции
	panic("implement me")
}

func (r *ScenarioRepository) SaveScenarioResult(ctx context.Context, userID string, scenarioID int, score int, status domain.Status) error {
	// сохраняет результат прохождения сценария
	panic("implement me")
}

func (r *ScenarioRepository) GetLeaderBoard(ctx context.Context, userID string) ([]*domain.LeaderboardEntry, error) {
	// получает лидерборд из 3 пользователей с наибольшим кол-вом очков, если текущего пользователя там нет, то из 4-х
	panic("implement me")
}
