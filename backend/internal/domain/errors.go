package domain

import "errors"

var (
	ErrInvalidToken         = errors.New("недействительный токен")
	ErrUserNotFound         = errors.New("пользователь не найден")
	ErrInvalidCredentials   = errors.New("неверный логин или пароль")
	ErrUserAlreadyExists    = errors.New("пользователь с таким именем уже существует")
	ErrMissingAuthHeader    = errors.New("отсутствует заголовок авторизации")
	ErrInvalidAuthHeader    = errors.New("неверный формат заголовка авторизации")
	ErrScenarioNodeNotFound = errors.New("узел сценария не найден")
)
