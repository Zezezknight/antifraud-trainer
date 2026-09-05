import {
  isRouteErrorResponse,
  Link,
  useMatches,
  useNavigate,
  useParams,
  useRevalidator,
  useRouteError,
  type Params,
} from 'react-router';
import { ServerCrash, CircleQuestionMark, type LucideIcon } from 'lucide-react';
import { Button } from './ui/button';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useState } from 'react';

export interface ErrorContent {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface RouteHandle {
  errorContent?: Partial<Record<number, ErrorContent>>;
  queryKeys?: QueryKey[] | ((params: Params) => QueryKey[]);
}

export const DEFAULT_ERROR_CONTENT: Record<number, ErrorContent> = {
  404: {
    title: 'Страница не найдена',
    description: 'Похоже, такой страницы не существует или она была удалена.',
    icon: CircleQuestionMark,
  },
  500: {
    title: 'Что-то пошло не так',
    description: 'Не удалось загрузить данные. Попробуйте ещё раз.',
    icon: ServerCrash,
  },
};

function RouteErrorBoundary() {
  const [retryIsPending, setRetryIsPending] = useState(false);

  const queryClient = useQueryClient();
  const params = useParams();
  const routeError = useRouteError();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const matches = useMatches();

  const status = isRouteErrorResponse(routeError) ? routeError.status : 500;
  const handle = matches.at(-1)?.handle as RouteHandle | undefined;

  const keys =
    typeof handle?.queryKeys === 'function'
      ? handle.queryKeys(params)
      : handle?.queryKeys;

  const {
    title,
    description,
    icon: Icon,
  } = handle?.errorContent?.[status]
    ? {
        ...(DEFAULT_ERROR_CONTENT[status] ?? DEFAULT_ERROR_CONTENT[500]),
        ...handle?.errorContent?.[status],
      }
    : (DEFAULT_ERROR_CONTENT[status] ?? DEFAULT_ERROR_CONTENT[500]);

  async function handleRetry() {
    setRetryIsPending(true);

    try {
      if (status === 404) return void navigate(-1);

      // Точечно инвалидируем только указанные ключи для этого роута
      if (keys) {
        for (const queryKey of keys) {
          await queryClient.resetQueries({ queryKey });
        }
      }

      await revalidator.revalidate();
    } catch (err) {
      console.log('Ошибка повторной попытки:', err);
    } finally {
      setRetryIsPending(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 justify-center">
      <div className="container-box flex flex-col gap-8">
        <h1 className="flex gap-4 text-5xl font-bold">
          <Icon className="size-12" />
          <span>
            {status}. {title}
          </span>
        </h1>
        <p className="text-xl">{description}</p>
        <div className="flex gap-4">
          <Button
            className="cursor-pointer"
            variant="default"
            size="lg"
            disabled={retryIsPending}
            onClick={() => void handleRetry()}
          >
            {retryIsPending
              ? 'Загрузка...'
              : status === 404
                ? 'Назад'
                : 'Повторить'}
          </Button>
          <Link to="/">
            <Button className="cursor-pointer" variant="outline" size="lg">
              На главную
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RouteErrorBoundary;
