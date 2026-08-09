package service

import (
	"avito-antifraud-trainer/internal/domain"
	"context"
	"fmt"
	"math"
	"sort"
	"sync"
)

type FakeRepo struct {
	mu sync.Mutex

	users           map[string]*domain.User
	usersByUsername map[string]*domain.User
	scenarios       map[int]*domain.Scenario
	nodes           map[int]*domain.ScenarioNode
	options         map[int]*domain.ScenarioOption
	results         map[string]map[int]*domain.UserScenarioResult

	nextUserID int
}

func NewFakeRepo() *FakeRepo {
	return &FakeRepo{
		users:           make(map[string]*domain.User),
		usersByUsername: make(map[string]*domain.User),
		scenarios:       make(map[int]*domain.Scenario),
		nodes:           make(map[int]*domain.ScenarioNode),
		options:         make(map[int]*domain.ScenarioOption),
		results:         make(map[string]map[int]*domain.UserScenarioResult),
	}
}

// ---- Сидеры для предзаполнения в тестах ----

func (f *FakeRepo) SeedUser(u *domain.User) *domain.User {
	f.mu.Lock()
	defer f.mu.Unlock()

	if u.ID == "" {
		f.nextUserID++
		u.ID = fmt.Sprintf("fake-user-%d", f.nextUserID)
	}
	f.users[u.ID] = u
	f.usersByUsername[u.Username] = u
	return u
}

func (f *FakeRepo) SeedScenario(s *domain.Scenario) *domain.Scenario {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.scenarios[s.ID] = s
	return s
}

func (f *FakeRepo) SeedNode(n *domain.ScenarioNode) *domain.ScenarioNode {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.nodes[n.ID] = n
	return n
}

func (f *FakeRepo) SeedOption(o *domain.ScenarioOption) *domain.ScenarioOption {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.options[o.ID] = o
	return o
}

// ---- UserRepoProvider ----

func (f *FakeRepo) CreateUser(_ context.Context, username string, passwordHash string) (*domain.User, error) {
	f.mu.Lock()
	defer f.mu.Unlock()

	if _, exists := f.usersByUsername[username]; exists {
		return nil, domain.ErrUserAlreadyExists
	}

	f.nextUserID++
	id := fmt.Sprintf("fake-user-%d", f.nextUserID)
	user := &domain.User{
		ID:                     id,
		Username:               username,
		PasswordHash:           passwordHash,
		Points:                 0,
		Status:                 "Новичок",
		CompletedEasyScenarios: 0,
		CompletedHardScenarios: 0,
	}
	f.users[id] = user
	f.usersByUsername[username] = user
	return user, nil
}

func (f *FakeRepo) GetUserByUsername(_ context.Context, username string) (*domain.User, error) {
	f.mu.Lock()
	defer f.mu.Unlock()

	user, ok := f.usersByUsername[username]
	if !ok {
		return nil, domain.ErrUserNotFound
	}
	cp := *user
	return &cp, nil
}

func (f *FakeRepo) GetUserByID(_ context.Context, id string) (*domain.User, error) {
	f.mu.Lock()
	defer f.mu.Unlock()

	user, ok := f.users[id]
	if !ok {
		return nil, domain.ErrUserNotFound
	}
	cp := *user
	return &cp, nil
}

func (f *FakeRepo) UpdateUserStatus(_ context.Context, id string, status string) error {
	f.mu.Lock()
	defer f.mu.Unlock()

	user, ok := f.users[id]
	if !ok {
		return domain.ErrUserNotFound
	}
	user.Status = status
	return nil
}

// ---- ScenarioRepoProvider ----

func (f *FakeRepo) GetScenarios(_ context.Context, role string) ([]*domain.Scenario, error) {
	f.mu.Lock()
	defer f.mu.Unlock()

	var out []*domain.Scenario
	for _, s := range f.scenarios {
		if s.Role == domain.Role(role) {
			cp := *s
			out = append(out, &cp)
		}
	}
	sort.Slice(out, func(i, j int) bool { return out[i].ID < out[j].ID })
	return out, nil
}

func (f *FakeRepo) GetScenarioByID(_ context.Context, scenarioID int) (*domain.Scenario, error) {
	f.mu.Lock()
	defer f.mu.Unlock()

	s, ok := f.scenarios[scenarioID]
	if !ok {
		return nil, domain.ErrScenarioNotFound
	}
	cp := *s
	return &cp, nil
}

func (f *FakeRepo) GetNodeByID(_ context.Context, nodeID int) (*domain.ScenarioNode, error) {
	f.mu.Lock()
	defer f.mu.Unlock()

	n, ok := f.nodes[nodeID]
	if !ok {
		return nil, domain.ErrScenarioNodeNotFound
	}
	cp := *n
	return &cp, nil
}

func (f *FakeRepo) GetOptionsForNode(_ context.Context, nodeID int) ([]*domain.ScenarioOption, error) {
	f.mu.Lock()
	defer f.mu.Unlock()

	var out []*domain.ScenarioOption
	for _, o := range f.options {
		if o.FromNodeID == nodeID {
			cp := *o
			out = append(out, &cp)
		}
	}
	sort.Slice(out, func(i, j int) bool { return out[i].ID < out[j].ID })
	return out, nil
}

func (f *FakeRepo) GetOptionByID(_ context.Context, optionID int) (*domain.ScenarioOption, error) {
	f.mu.Lock()
	defer f.mu.Unlock()

	o, ok := f.options[optionID]
	if !ok {
		return nil, domain.ErrScenarioOptionNotFound
	}
	cp := *o
	return &cp, nil
}

// SaveScenarioResult повторяет логику SQL-репозитория:
//   - сохраняет результат, только если он лучше предыдущего (score выше);
//   - пересчитывает очки пользователя и счётчики завершённых сценариев
//     (аналог UPDATE users SET points = (SELECT SUM(score) ...), ...).
func (f *FakeRepo) SaveScenarioResult(
	_ context.Context,
	userID string,
	scenarioID int,
	score int,
	status string,
	difficulty string,
) error {
	f.mu.Lock()
	defer f.mu.Unlock()

	user, ok := f.users[userID]
	if !ok {
		// В SQL INSERT INTO user_scenario_results не сработает, если нет пользователя (FK violation)
		return domain.ErrUserNotFound
	}

	results, ok := f.results[userID]
	if !ok {
		results = make(map[int]*domain.UserScenarioResult)
		f.results[userID] = results
	}

	// Аналог: ON CONFLICT ... WHERE user_scenario_results.score < EXCLUDED.score
	if existing, exists := results[scenarioID]; !exists || score > existing.Score {
		results[scenarioID] = &domain.UserScenarioResult{
			UserID:     userID,
			ScenarioID: scenarioID,
			Score:      score,
			Difficulty: domain.Difficulty(difficulty),
			Status:     domain.Status(status),
		}
	}

	// Пересчёт статистики пользователя.
	totalScore := 0
	easyCompleted := 0
	hardCompleted := 0
	for _, r := range results {
		totalScore += r.Score
		if r.Status == domain.StatusGreen {
			switch r.Difficulty {
			case domain.DifficultyEasy:
				easyCompleted++
			case domain.DifficultyHard:
				hardCompleted++
			}
		}
	}
	user.Points = totalScore
	user.CompletedEasyScenarios = easyCompleted
	user.CompletedHardScenarios = hardCompleted

	return nil
}

// GetScenarioResult возвращает (nil, nil), если результата нет —
// это соответствует поведению SQL-репозитория (sql.ErrNoRows обрабатывается как nil, nil).
func (f *FakeRepo) GetScenarioResult(_ context.Context, userID string, scenarioID int) (*domain.UserScenarioResult, error) {
	f.mu.Lock()
	defer f.mu.Unlock()

	results, ok := f.results[userID]
	if !ok {
		return nil, nil
	}
	r, ok := results[scenarioID]
	if !ok {
		return nil, nil
	}
	cp := *r
	return &cp, nil
}

// GetLeaderBoard воспроизводит SQL-запрос:
//
//	WITH ranked AS (
//	  SELECT ..., DENSE_RANK() OVER (ORDER BY points DESC) AS rank FROM users
//	)
//	SELECT ... FROM ranked WHERE rank <= 3
//	UNION ALL
//	SELECT ... FROM ranked WHERE id = $1 AND rank > 3
//	ORDER BY rank
func (f *FakeRepo) GetLeaderBoard(_ context.Context, userID string) ([]*domain.LeaderboardEntry, error) {
	f.mu.Lock()
	defer f.mu.Unlock()

	sorted := make([]*domain.User, 0, len(f.users))
	for _, u := range f.users {
		sorted = append(sorted, u)
	}
	sort.Slice(sorted, func(i, j int) bool {
		return sorted[i].Points > sorted[j].Points
	})

	ranks := make(map[string]int, len(sorted))
	currentRank := 0
	prevPoints := math.MinInt32 // Используем MinInt32 для корректного ранжирования при любых значениях очков
	for _, u := range sorted {
		if u.Points != prevPoints {
			currentRank++
			prevPoints = u.Points
		}
		ranks[u.ID] = currentRank
	}

	var entries []*domain.LeaderboardEntry
	for _, u := range sorted {
		rank := ranks[u.ID]
		if rank <= 3 || u.ID == userID {
			entries = append(entries, &domain.LeaderboardEntry{
				Rank:     rank,
				UserID:   u.ID,
				Username: u.Username,
				Points:   u.Points,
				Status:   u.Status,
			})
		}
	}

	sort.Slice(entries, func(i, j int) bool {
		return entries[i].Rank < entries[j].Rank
	})
	return entries, nil
}
