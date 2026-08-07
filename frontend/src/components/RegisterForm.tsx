import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { registerUser } from '@/service/auth';
import { useSetUser } from '@/store/user';
import { isApiError } from '@/types/api';
import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import * as z from 'zod';

interface RegisterData {
  login: string;
  password: string;
  passwordAgain: string;
}

export function RegisterForm() {
  const navigate = useNavigate();
  const setUser = useSetUser();
  const [registerData, setRegisterData] = useState<RegisterData>({
    login: '',
    password: '',
    passwordAgain: '',
  });
  const canSubmit = !Object.values(registerData).some(val => val === '');
  const [error, setError] = useState<string | string[] | null>(null);

  function handleRegisterDataChange(field: keyof RegisterData, value: string) {
    setRegisterData({
      ...registerData,
      [field]: value,
    });
  }

  async function handleFormSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(null);

    if (registerData.password !== registerData.passwordAgain) {
      setError('пароли должны совпадать');
      return;
    }

    try {
      const userResponse = await registerUser({
        username: registerData.login,
        password: registerData.password,
      });
      setUser({
        token: userResponse.token,
        id: userResponse.user.user_id,
        name: userResponse.user.username,
      });
      await navigate('/');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map(issue => issue.message);
        setError(messages.length === 1 ? messages[0] : messages);
        return;
      }

      if (axios.isAxiosError(error) && isApiError(error.response?.data)) {
        setError(error.response?.data.message);
        return;
      }

      setError('не удалось зарегистрироваться');
    }
  }

  const errorMessages = Array.isArray(error) ? error : error ? [error] : [];

  return (
    <div className="flex flex-col gap-6 w-2/3">
      <Card className="py-6 px-2">
        <CardHeader>
          <CardTitle>Зарегистрироваться</CardTitle>
          <CardDescription>
            Создайте аккаунт, чтобы продолжить тренировку.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={e => {
              void handleFormSubmit(e);
            }}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="login">Логин</FieldLabel>
                <Input
                  id="login"
                  type="text"
                  placeholder="Например, alex_2024"
                  required
                  value={registerData.login}
                  onChange={e =>
                    handleRegisterDataChange('login', e.target.value)
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Пароль</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Минимум 6 символов"
                  required
                  minLength={6}
                  value={registerData.password}
                  onChange={e =>
                    handleRegisterDataChange('password', e.target.value)
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Повторите пароль</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Минимум 6 символов"
                  required
                  minLength={6}
                  value={registerData.passwordAgain}
                  onChange={e =>
                    handleRegisterDataChange('passwordAgain', e.target.value)
                  }
                />
              </Field>
              {errorMessages.length > 0 ? (
                <div className="text-center text-destructive">
                  {errorMessages.length === 1 ? (
                    <div>{errorMessages[0]}</div>
                  ) : (
                    <ul className="list-disc list-inside text-left">
                      {errorMessages.map(message => (
                        <li key={message}>{message}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
              <Field>
                <Button type="submit" disabled={!canSubmit}>
                  Зарегистрироваться
                </Button>
                <FieldDescription className="text-center">
                  Уже есть аккаунт? <Link to="/login">Войти</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
