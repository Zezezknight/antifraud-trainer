package domain

import "time"

type Role string
type Difficulty string
type Status string

const (
	RoleSeller Role = "seller"
	RoleBuyer  Role = "buyer"

	DifficultyEasy Difficulty = "easy"
	DifficultyHard Difficulty = "hard"

	StatusGreen  Status = "green"
	StatusYellow Status = "yellow"
	StatusRed    Status = "red"
)

type Scenario struct {
	ID             int
	Title          string
	Description    string
	Role           Role
	Difficulty     Difficulty
	RequiredPoints int
	StartNodeID    int
	IsAvailable    bool
}

type ScenarioNode struct {
	ID          int
	ScenarioID  int
	MessageText string
	IsFinal     bool
	FinalStatus *Status
}

type ScenarioOption struct {
	ID          int
	FromNodeID  int
	ToNodeID    int
	MessageText string
	Status      Status
}

type UserScenarioResult struct {
	UserID      string
	ScenarioID  int
	BestScore   int
	Status      Status
	CompletedAt time.Time
}

type LeaderboardEntry struct {
	Rank     int
	UserID   string
	Username string
	Points   int
	Status   string
}
