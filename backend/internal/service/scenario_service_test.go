package service

import (
	"context"
	"testing"

	"avito-antifraud-trainer/internal/domain"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func setupScenarioService() (*ScenarioService, *FakeRepo) {
	repo := NewFakeRepo()
	svc := NewScenarioService(repo, repo)
	return svc, repo
}

func TestScenarioService_GetAvailableScenarios(t *testing.T) {
	ctx := context.Background()
	svc, repo := setupScenarioService()

	repo.SeedUser(&domain.User{ID: "user-1", Username: "test", Points: 0, Status: "Новичок"})

	// Сценарий 1: базовый, доступен сразу
	repo.SeedScenario(&domain.Scenario{
		ID:                         1,
		Title:                      "Easy Scenario 1",
		Role:                       domain.Role("junior"),
		Difficulty:                 domain.Difficulty("easy"),
		RequiredScenariosThisLevel: 0,
		StartNodeID:                10,
	})
	// Сценарий 2: требует 1 пройденный сценарий этой же сложности (easy)
	repo.SeedScenario(&domain.Scenario{
		ID:                         2,
		Title:                      "Easy Scenario 2",
		Role:                       domain.Role("junior"),
		Difficulty:                 domain.Difficulty("easy"),
		RequiredScenariosThisLevel: 1,
		StartNodeID:                20,
	})
	// Сценарий 3: хард, доступен сразу
	repo.SeedScenario(&domain.Scenario{
		ID:                         3,
		Title:                      "Hard Scenario",
		Role:                       domain.Role("junior"),
		Difficulty:                 domain.Difficulty("hard"),
		RequiredScenariosThisLevel: 0,
		StartNodeID:                30,
	})

	t.Run("initial state", func(t *testing.T) {
		scenarios, err := svc.GetAvailableScenarios(ctx, "user-1", "junior")
		require.NoError(t, err)
		require.Len(t, scenarios, 3)

		assert.True(t, scenarios[0].IsAvailable, "Easy 1 should be available (req 0)")
		assert.Nil(t, scenarios[0].BestScore)

		assert.False(t, scenarios[1].IsAvailable, "Easy 2 should be locked (req 1, completed 0)")
		assert.Nil(t, scenarios[1].BestScore)

		assert.True(t, scenarios[2].IsAvailable, "Hard should be available (req 0)")
		assert.Nil(t, scenarios[2].BestScore)
	})

	t.Run("after completing easy 1 - easy 2 is unlocked", func(t *testing.T) {
		// Сохраняем успешный результат для первого easy сценария
		err := svc.SaveScenarioResult(ctx, "user-1", 1, 100, "green", "easy")
		require.NoError(t, err)

		scenarios, err := svc.GetAvailableScenarios(ctx, "user-1", "junior")
		require.NoError(t, err)
		require.Len(t, scenarios, 3)

		assert.True(t, scenarios[0].IsAvailable)
		require.NotNil(t, scenarios[0].BestScore)
		assert.Equal(t, 100, *scenarios[0].BestScore)

		assert.True(t, scenarios[1].IsAvailable, "Easy 2 should be unlocked now (req 1, completed 1)")
		assert.Nil(t, scenarios[1].BestScore, "Best score should be nil for unplayed scenario")

		assert.True(t, scenarios[2].IsAvailable)
	})

	t.Run("user not found", func(t *testing.T) {
		_, err := svc.GetAvailableScenarios(ctx, "unknown-user", "junior")
		assert.ErrorIs(t, err, domain.ErrUserNotFound)
	})
}

func TestScenarioService_GetScenarioByID(t *testing.T) {
	ctx := context.Background()
	svc, repo := setupScenarioService()

	repo.SeedScenario(&domain.Scenario{ID: 1, Title: "Test"})
	repo.SeedUser(&domain.User{ID: "Test"})

	t.Run("success", func(t *testing.T) {
		s, err := svc.GetScenarioByID(ctx, 1, "Test")
		require.NoError(t, err)
		assert.Equal(t, "Test", s.Title)
	})

	t.Run("not found", func(t *testing.T) {
		_, err := svc.GetScenarioByID(ctx, 999, "Test")
		assert.ErrorIs(t, err, domain.ErrScenarioNotFound)
	})
}

func TestScenarioService_GetNodeByID(t *testing.T) {
	ctx := context.Background()
	svc, repo := setupScenarioService()

	repo.SeedNode(&domain.ScenarioNode{ID: 1, MessageText: "Node 1"})

	t.Run("success", func(t *testing.T) {
		n, err := svc.GetNodeByID(ctx, 1)
		require.NoError(t, err)
		assert.Equal(t, "Node 1", n.MessageText)
	})

	t.Run("not found", func(t *testing.T) {
		_, err := svc.GetNodeByID(ctx, 999)
		assert.ErrorIs(t, err, domain.ErrScenarioNodeNotFound)
	})
}

func TestScenarioService_GetOptionByID(t *testing.T) {
	ctx := context.Background()
	svc, repo := setupScenarioService()

	repo.SeedOption(&domain.ScenarioOption{ID: 1, MessageText: "Option 1"})

	t.Run("success", func(t *testing.T) {
		o, err := svc.GetOptionByID(ctx, 1)
		require.NoError(t, err)
		assert.Equal(t, "Option 1", o.MessageText)
	})

	t.Run("not found", func(t *testing.T) {
		_, err := svc.GetOptionByID(ctx, 999)
		assert.ErrorIs(t, err, domain.ErrScenarioOptionNotFound)
	})
}

func TestScenarioService_GetOptionsForNode(t *testing.T) {
	ctx := context.Background()
	svc, repo := setupScenarioService()

	repo.SeedOption(&domain.ScenarioOption{ID: 1, FromNodeID: 10})
	repo.SeedOption(&domain.ScenarioOption{ID: 2, FromNodeID: 10})
	repo.SeedOption(&domain.ScenarioOption{ID: 3, FromNodeID: 20})

	t.Run("success", func(t *testing.T) {
		opts, err := svc.GetOptionsForNode(ctx, 10)
		require.NoError(t, err)
		assert.Len(t, opts, 2)
	})

	t.Run("empty list", func(t *testing.T) {
		opts, err := svc.GetOptionsForNode(ctx, 999)
		require.NoError(t, err)
		assert.Empty(t, opts)
	})
}

func TestScenarioService_ProcessStep(t *testing.T) {
	ctx := context.Background()
	svc, repo := setupScenarioService()

	repo.SeedNode(&domain.ScenarioNode{ID: 1, MessageText: "Node 1"})
	repo.SeedNode(&domain.ScenarioNode{ID: 2, MessageText: "Node 2"})
	repo.SeedOption(&domain.ScenarioOption{ID: 10, FromNodeID: 1, ToNodeID: 2})

	t.Run("success", func(t *testing.T) {
		nextNode, err := svc.ProcessStep(ctx, 10)
		require.NoError(t, err)
		assert.Equal(t, 2, nextNode.ID)
	})

	t.Run("option not found", func(t *testing.T) {
		_, err := svc.ProcessStep(ctx, 999)
		assert.ErrorIs(t, err, domain.ErrScenarioOptionNotFound)
	})

	t.Run("next node not found", func(t *testing.T) {
		repo.SeedOption(&domain.ScenarioOption{ID: 11, FromNodeID: 1, ToNodeID: 999})
		_, err := svc.ProcessStep(ctx, 11)
		assert.ErrorIs(t, err, domain.ErrScenarioNodeNotFound)
	})
}

func TestScenarioService_SaveScenarioResult(t *testing.T) {
	ctx := context.Background()
	svc, repo := setupScenarioService()

	repo.SeedUser(&domain.User{ID: "user-1", Username: "test", Points: 0, Status: "Новичок"})

	t.Run("save new result and update user status", func(t *testing.T) {
		// 100 очков -> статус "Бдительный"
		err := svc.SaveScenarioResult(ctx, "user-1", 1, 100, "green", "easy")
		require.NoError(t, err)

		user, err := repo.GetUserByID(ctx, "user-1")
		require.NoError(t, err)
		assert.Equal(t, 100, user.Points)
		assert.Equal(t, "Внимательный", user.Status)
		assert.Equal(t, 1, user.CompletedEasyScenarios)
	})

	t.Run("save better result and update status", func(t *testing.T) {
		// 200 очков -> статус "Бдительный"
		// Тот же сценарий, но больше очков
		err := svc.SaveScenarioResult(ctx, "user-1", 1, 200, "green", "easy")
		require.NoError(t, err)

		user, err := repo.GetUserByID(ctx, "user-1")
		require.NoError(t, err)
		assert.Equal(t, 200, user.Points)
		assert.Equal(t, "Бдительный", user.Status)
		assert.Equal(t, 1, user.CompletedEasyScenarios, "count shouldn't double for same scenario")
	})

	t.Run("save worse result is ignored", func(t *testing.T) {
		// Очки не должны перезаписаться, если результат хуже
		err := svc.SaveScenarioResult(ctx, "user-1", 1, 50, "yellow", "easy")
		require.NoError(t, err)

		user, err := repo.GetUserByID(ctx, "user-1")
		require.NoError(t, err)
		assert.Equal(t, 200, user.Points, "points should remain 200")
		assert.Equal(t, "Бдительный", user.Status)
	})

	t.Run("user not found", func(t *testing.T) {
		err := svc.SaveScenarioResult(ctx, "unknown", 1, 100, "green", "easy")
		assert.ErrorIs(t, err, domain.ErrUserNotFound)
	})
}

func TestScenarioService_GetScenarioResult(t *testing.T) {
	ctx := context.Background()
	svc, repo := setupScenarioService()

	repo.SeedUser(&domain.User{ID: "user-1", Username: "test"})

	t.Run("no result returns nil", func(t *testing.T) {
		res, err := svc.GetScenarioResult(ctx, "user-1", 1)
		require.NoError(t, err)
		assert.Nil(t, res)
	})

	t.Run("returns saved result", func(t *testing.T) {
		err := svc.SaveScenarioResult(ctx, "user-1", 1, 100, "green", "easy")
		require.NoError(t, err)

		res, err := svc.GetScenarioResult(ctx, "user-1", 1)
		require.NoError(t, err)
		require.NotNil(t, res)
		assert.Equal(t, 100, res.Score)
	})
}

func TestScenarioService_GetLeaderBoard(t *testing.T) {
	ctx := context.Background()
	svc, repo := setupScenarioService()

	// 4 пользователя с разными очками
	repo.SeedUser(&domain.User{ID: "u1", Username: "u1", Points: 10, Status: "Новичок"})
	repo.SeedUser(&domain.User{ID: "u2", Username: "u2", Points: 20, Status: "Новичок"})
	repo.SeedUser(&domain.User{ID: "u3", Username: "u3", Points: 30, Status: "Бдительный"})
	repo.SeedUser(&domain.User{ID: "u4", Username: "u4", Points: 40, Status: "Внимательный"})
	repo.SeedUser(&domain.User{ID: "u5", Username: "u5", Points: 5, Status: "Новичок"})

	t.Run("top 3 and current user", func(t *testing.T) {
		// Запрашиваем для u5 (5 место)
		lb, err := svc.GetLeaderBoard(ctx, "u5")
		require.NoError(t, err)
		require.Len(t, lb, 4) // Топ-3 (u4, u3, u2) + u5

		assert.Equal(t, 1, lb[0].Rank)
		assert.Equal(t, "u4", lb[0].UserID)

		assert.Equal(t, 2, lb[1].Rank)
		assert.Equal(t, "u3", lb[1].UserID)

		assert.Equal(t, 3, lb[2].Rank)
		assert.Equal(t, "u2", lb[2].UserID)

		assert.Equal(t, 5, lb[3].Rank) // u5 на 5-м месте (u1 на 4-м)
		assert.Equal(t, "u5", lb[3].UserID)
	})

	t.Run("user in top 3", func(t *testing.T) {
		// Запрашиваем для u4 (1 место)
		lb, err := svc.GetLeaderBoard(ctx, "u4")
		require.NoError(t, err)
		require.Len(t, lb, 3, "should return only top 3 without duplicate")
		assert.Equal(t, "u4", lb[0].UserID)
	})
}
