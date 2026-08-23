import {
  isRouteErrorResponse,
  Link,
  useMatches,
  useNavigate,
  useRevalidator,
  useRouteError,
} from 'react-router';
import { ServerCrash, CircleQuestionMark, type LucideIcon } from 'lucide-react';
import { Button } from './ui/button';

export interface ErrorContent {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface RouteHandle {
  errorContent: Partial<Record<number, ErrorContent>>;
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
  const error = useRouteError();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const matches = useMatches();

  const status = isRouteErrorResponse(error) ? error.status : 500;
  const handle = matches.at(-1)?.handle as RouteHandle | undefined;

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
            onClick={() => {
              if (status === 404) return void navigate(-1);
              return void revalidator.revalidate();
            }}
          >
            {status === 404 ? 'Назад' : 'Повторить'}
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
