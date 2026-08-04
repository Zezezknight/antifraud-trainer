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

type Error struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}
