package service

import (
	"avito-antifraud-trainer/internal/domain"
	"context"
)

type ScenarioRepoProvider interface {
	GetScenarios(ctx context.Context, role string) ([]*domain.Scenario, error)
	GetNodeByID(ctx context.Context, nodeID int) (*domain.ScenarioNode, error)
	GetOptionsForNode(ctx context.Context, nodeID int) ([]*domain.ScenarioOption, error)
	GetOptionByID(ctx context.Context, optionID int) (*domain.ScenarioOption, error)
	SaveScenarioResult(ctx context.Context, userID string, scenarioID int, score int, status domain.Status) error
	GetLeaderBoard(ctx context.Context, userID string) ([]*domain.LeaderboardEntry, error)
}

type ScenarioService struct {
	userRepo     UserRepoProvider
	scenarioRepo ScenarioRepoProvider
}

func NewScenarioService(repo UserRepoProvider, scenarioRepo ScenarioRepoProvider) *ScenarioService {
	return &ScenarioService{
		userRepo:     repo,
		scenarioRepo: scenarioRepo,
	}
}

func (s *ScenarioService) GetAvailableScenarios(ctx context.Context, userID string, role string) ([]*domain.Scenario, error) {
	// возвращает сценарии доступные пользователю в зависимости от его баллов
	panic("implement me")
}

func (s *ScenarioService) GetScenarioByID(ctx context.Context, scenarioID int) (*domain.Scenario, error) {
	// возвращает сценарий по его ID
	panic("implement me")
}

func (s *ScenarioService) GetNodeByID(ctx context.Context, nodeID int) (*domain.ScenarioNode, error) {
	// возвращает узел по его ID
	panic("implement me")
}

func (s *ScenarioService) ProcessStep(ctx context.Context, currentOptionID int) (*domain.ScenarioNode, error) {
	// возвращает следующий узел по выбранной опции, если существует
	panic("implement me")
}

func (s *ScenarioService) GetOptionsForNode(ctx context.Context, nodeID int) ([]*domain.ScenarioOption, error) {
	// возвращает список опций для текущего узла
	panic("implement me")
}

func (s *ScenarioService) SaveScenarioResult(ctx context.Context, userID string, scenarioID int, score int, status domain.Status) error {
	// сохраняет результат сценария
	panic("implement me")
}
