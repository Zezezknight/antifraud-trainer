package domain

import "errors"

var (
	ErrInvalidToken       = errors.New("недействительный токен")
	ErrUserNotFound       = errors.New("пользователь не найден")
	ErrInvalidCredentials = errors.New("неверный логин или пароль")
	ErrUserAlreadyExists  = errors.New("пользователь с таким именем уже существует")
)
