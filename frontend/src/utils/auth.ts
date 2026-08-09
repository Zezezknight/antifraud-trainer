import { AUTH_STORAGE_KEY } from '@/store/user';
import { jwtDecode } from 'jwt-decode';
import { redirect } from 'react-router';

export function isTokenExpired(token: string | null) {
  if (!token) return true;

  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
}

export function getTokenFromLocalStorage(): string | null {
  try {
    const storage = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!storage) return null;

    const parsed = JSON.parse(storage) as {
      state?: { user?: { token?: string } };
    };
    return parsed?.state?.user?.token ?? null;
  } catch {
    return null;
  }
}

export function checkTokenValidity(): Response | null {
  const token = getTokenFromLocalStorage();
  if (!token || isTokenExpired(token)) {
    return redirect('/login');
  }
  return null;
}
