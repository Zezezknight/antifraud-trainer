package service

import (
	"avito-antifraud-trainer/internal/domain"
	"context"
)

type FakeRepo struct {
}

func (f *FakeRepo) CreateUser(ctx context.Context, username string, password string) (*domain.User, error) {
	panic("implement me")
}

func (f *FakeRepo) GetUserByUsername(ctx context.Context, username string) (*domain.User, error) {
	panic("implement me")
}

func (f *FakeRepo) GetUserByID(ctx context.Context, id string) (*domain.User, error) {
	panic("implement me")
}

func (f *FakeRepo) UpdateUserStatus(ctx context.Context, id string, status string) error {
	panic("implement me")
}

func (f *FakeRepo) GetScenarios(ctx context.Context, role string) ([]*domain.Scenario, error) {
	panic("implement me")
}

func (f *FakeRepo) GetScenarioByID(ctx context.Context, scenarioID int) (*domain.Scenario, error) {
	panic("implement me")
}

func (f *FakeRepo) GetNodeByID(ctx context.Context, nodeID int) (*domain.ScenarioNode, error) {
	panic("implement me")
}

func (f *FakeRepo) GetOptionsForNode(ctx context.Context, nodeID int) ([]*domain.ScenarioOption, error) {
	panic("implement me")
}

func (f *FakeRepo) GetOptionByID(ctx context.Context, optionID int) (*domain.ScenarioOption, error) {
	panic("implement me")
}

func (f *FakeRepo) SaveScenarioResult(ctx context.Context, userID string, scenarioID int, score int, status string, difficulty string) error {
	panic("implement me")
}

func (f *FakeRepo) GetScenarioResult(ctx context.Context, userID string, scenarioID int) (*domain.UserScenarioResult, error) {
	panic("implement me")
}

func (f *FakeRepo) GetLeaderBoard(ctx context.Context, userID string) ([]*domain.LeaderboardEntry, error) {
	panic("implement me")
}
