package dto

type AuthRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}
type User struct {
	ID       string `json:"user_id"`
	Username string `json:"username"`
}

type ScenarioCard struct {
	ID             int    `json:"id"`
	Title          string `json:"title"`
	Difficulty     string `json:"difficulty"`
	RequiredPoints int    `json:"required_points"`
}

type ScenarioFull struct {
	ID             int    `json:"id"`
	Title          string `json:"title"`
	Description    string `json:"description"`
	Role           string `json:"role"`
	Difficulty     string `json:"difficulty"`
	RequiredPoints int    `json:"required_points"`
}

type Error struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}
