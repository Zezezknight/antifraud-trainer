package service

import (
	"avito-antifraud-trainer/internal/domain"
	"context"
	"fmt"
)

type ScenarioRepoProvider interface {
	GetScenarios(ctx context.Context, role string) ([]*domain.Scenario, error)
	GetScenarioByID(ctx context.Context, scenarioID int) (*domain.Scenario, error)
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

func (s *ScenarioService) GetAvailableScenarios(
	ctx context.Context,
	userID string,
	role string,
) ([]*domain.Scenario, error) {
	user, err := s.userRepo.GetUserByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("userRepo.GetUserByID: %w", err)
	}

	scenarios, err := s.scenarioRepo.GetScenarios(ctx, role)
	if err != nil {
		return nil, fmt.Errorf("scenarioRepo.GetScenarios: %w", err)
	}

	for _, sc := range scenarios {
		available := user.Points >= sc.RequiredPoints
		sc.IsAvailable = available
	}

	return scenarios, nil
}

func (s *ScenarioService) GetScenarioByID(
	ctx context.Context,
	scenarioID int,
) (*domain.Scenario, error) {
	scenario, err := s.scenarioRepo.GetScenarioByID(ctx, scenarioID)
	if err != nil {
		return nil, fmt.Errorf("scenarioRepo.GetScenarioByID: %w", err)
	}
	if scenario == nil {
		return nil, domain.ErrScenarioNotFound
	}
	return scenario, nil
}

func (s *ScenarioService) GetNodeByID(
	ctx context.Context,
	nodeID int,
) (*domain.ScenarioNode, error) {
	node, err := s.scenarioRepo.GetNodeByID(ctx, nodeID)
	if err != nil {
		return nil, fmt.Errorf("scenarioRepo.GetNodeByID: %w", err)
	}
	if node == nil {
		return nil, domain.ErrNodeNotFound
	}
	return node, nil
}

func (s *ScenarioService) ProcessStep(
	ctx context.Context,
	currentOptionID int,
) (*domain.ScenarioNode, error) {
	option, err := s.scenarioRepo.GetOptionByID(ctx, currentOptionID)
	if err != nil {
		return nil, fmt.Errorf("scenarioRepo.GetOptionByID: %w", err)
	}
	if option == nil {
		return nil, domain.ErrOptionNotFound
	}

	nextNode, err := s.scenarioRepo.GetNodeByID(ctx, option.ToNodeID)
	if err != nil {
		return nil, fmt.Errorf("scenarioRepo.GetNodeByID (next): %w", err)
	}
	if nextNode == nil {
		return nil, domain.ErrNodeNotFound
	}

	return nextNode, nil
}

func (s *ScenarioService) GetOptionsForNode(
	ctx context.Context,
	nodeID int,
) ([]*domain.ScenarioOption, error) {
	options, err := s.scenarioRepo.GetOptionsForNode(ctx, nodeID)
	if err != nil {
		return nil, fmt.Errorf("scenarioRepo.GetOptionsForNode: %w", err)
	}
	return options, nil
}

func (s *ScenarioService) SaveScenarioResult(
	ctx context.Context,
	userID string,
	scenarioID int,
	score int,
	status domain.Status,
) (domain.Status, error) {
	if err := s.scenarioRepo.SaveScenarioResult(ctx, userID, scenarioID, score, status); err != nil {
		return status, fmt.Errorf("scenarioRepo.SaveScenarioResult: %w", err)
	}

	return status, nil
}
