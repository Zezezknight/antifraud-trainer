package dto

type AuthRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type AuthResponse struct {
	User User `json:"user"`
}
type User struct {
	ID                     string `json:"user_id"`
	Username               string `json:"username"`
	Status                 string `json:"status"`
	Points                 int    `json:"points"`
	CompletedEasyScenarios int    `json:"completed_easy_scenarios"`
	CompletedHardScenarios int    `json:"completed_hard_scenarios"`
}
