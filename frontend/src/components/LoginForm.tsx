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
import { useSetUser } from '@/store/user';
import { isApiError } from '@/types/api';
import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import * as z from 'zod';
import { loginUser } from '@/service/auth';

interface LoginData {
  login: string;
  password: string;
}

export function LoginForm() {
  const navigate = useNavigate();
  const setUser = useSetUser();
  const [loginData, setLoginData] = useState<LoginData>({
    login: '',
    password: '',
  });
  const canSubmit = !Object.values(loginData).some(val => val === '');
  const [error, setError] = useState<string | string[] | null>(null);

  function handleLoginDataChange(field: keyof LoginData, value: string) {
    setLoginData({
      ...loginData,
      [field]: value,
    });
  }

  async function handleFormSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(null);

    try {
      const user = await loginUser({
        username: loginData.login,
        password: loginData.password,
      });
      setUser(user);
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
          <CardTitle>Войти в аккаунт</CardTitle>
          <CardDescription>
            Войдите, чтобы продолжить тренировку.
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
                  value={loginData.login}
                  onChange={e => handleLoginDataChange('login', e.target.value)}
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
                  value={loginData.password}
                  onChange={e =>
                    handleLoginDataChange('password', e.target.value)
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
                  Войти
                </Button>
                <FieldDescription className="text-center">
                  Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
