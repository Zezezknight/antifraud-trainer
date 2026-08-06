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
	SaveScenarioResult(ctx context.Context, userID string, scenarioID int, score int, status string, difficulty string) error
	GetScenarioResult(ctx context.Context, userID string, scenarioID int) (*domain.UserScenarioResult, error)
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
	_, err := s.userRepo.GetUserByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("userRepo.GetUserByID: %w", err)
	}

	scenarios, err := s.scenarioRepo.GetScenarios(ctx, role)
	if err != nil {
		return nil, fmt.Errorf("scenarioRepo.GetScenarios: %w", err)
	}

	completedByDifficulty := make(map[domain.Difficulty]int)
	for _, sc := range scenarios {
		result, err := s.scenarioRepo.GetScenarioResult(ctx, userID, sc.ID)
		if err != nil {
			return nil, fmt.Errorf("scenarioRepo.GetScenarioResult: %w", err)
		}

		if result != nil {
			bestScore := result.Score
			sc.BestScore = &bestScore

			if result.Status == domain.StatusGreen {
				completedByDifficulty[sc.Difficulty]++
			}
		}
	}

	for _, sc := range scenarios {
		sc.IsAvailable = completedByDifficulty[sc.Difficulty] >= sc.RequiredScenariosThisLevel
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
		return nil, domain.ErrScenarioNodeNotFound
	}
	return node, nil
}

func (s *ScenarioService) GetOptionByID(ctx context.Context, optionID int) (*domain.ScenarioOption, error) {
	option, err := s.scenarioRepo.GetOptionByID(ctx, optionID)
	if err != nil {
		return nil, fmt.Errorf("scenarioRepo.GetOptionByID: %w", err)
	}
	if option == nil {
		return nil, domain.ErrScenarioOptionNotFound
	}
	return option, nil
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
		return nil, domain.ErrScenarioOptionNotFound
	}

	nextNode, err := s.scenarioRepo.GetNodeByID(ctx, option.ToNodeID)
	if err != nil {
		return nil, fmt.Errorf("scenarioRepo.GetNodeByID (next): %w", err)
	}
	if nextNode == nil {
		return nil, domain.ErrScenarioNodeNotFound
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
	status string,
	difficulty string,
) error {
	if err := s.scenarioRepo.SaveScenarioResult(ctx, userID, scenarioID, score, status, difficulty); err != nil {
		return fmt.Errorf("scenarioRepo.SaveScenarioResult: %w", err)
	}

	user, err := s.userRepo.GetUserByID(ctx, userID)
	if err != nil {
		return fmt.Errorf("userRepo.GetUserByID: %w", err)
	}

	var newStatus string
	switch {
	case user.Points >= 300:
		newStatus = "Эксперт безопасности"
	case user.Points >= 200:
		newStatus = "Внимательный"
	case user.Points >= 100:
		newStatus = "Бдительный"
	default:
		newStatus = ""
	}

	if user.Status != newStatus {
		if err := s.userRepo.UpdateUserStatus(ctx, userID, newStatus); err != nil {
			return fmt.Errorf("userRepo.UpdateUserStatus: %w", err)
		}
	}

	return nil
}

func (s *ScenarioService) GetScenarioResult(
	ctx context.Context,
	userID string,
	scenarioID int,
) (*domain.UserScenarioResult, error) {
	result, err := s.scenarioRepo.GetScenarioResult(ctx, userID, scenarioID)
	if err != nil {
		return nil, fmt.Errorf("scenarioRepo.GetScenarioResult: %w", err)
	}
	return result, nil
}

func (s *ScenarioService) GetLeaderBoard(ctx context.Context, userID string) ([]*domain.LeaderboardEntry, error) {
	leaderboard, err := s.scenarioRepo.GetLeaderBoard(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("scenarioRepo.GetLeaderBoard: %w", err)
	}
	return leaderboard, nil
}
