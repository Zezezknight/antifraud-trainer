import { AUTH_STORAGE_KEY, clearUser } from '@/store/user';
import { isAxiosError } from 'axios';
import { redirect } from 'react-router';

export function mapLoaderError(err: unknown) {
  if (isAxiosError(err) && err.response?.status === 401) {
    clearUser();
    localStorage.removeItem(AUTH_STORAGE_KEY);
    throw redirect('/login');
  }
  if (isAxiosError(err) && err.response?.status === 404) {
    throw new Response('Not Found', { status: 404 });
  }
  throw new Response('Server Error', { status: 500 });
}
