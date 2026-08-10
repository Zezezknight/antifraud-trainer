import NavigationBar from '@/components/NavigationBar';
import type { ProfileLoader } from '@/loaders/profile';
import { useLoaderData, useNavigate } from 'react-router';
import { CircleStar, TargetIcon, CircleCheck } from 'lucide-react';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import newbyeStatus from '/Новичок.png';
import attentiveStatus from '/Внимательный.png';
import vigilantStatus from '/Бдительный.png';
import securityExpertStatus from '/Эксперт безопасности.png';
import {
  USER_STATUS_CODES,
  USER_STATUSES,
  USER_STATUSES_START_POINTS,
  type UserStatus,
} from '@/types/profile';
import closedStatus from '/closed.png';
import { Fragment, useEffect, useState } from 'react';
import { AUTH_STORAGE_KEY, clearUser, useUser } from '@/store/user';
import { Button } from '@/components/ui/button';

interface StatsCardProps {
  icon: React.JSX.Element;
  title: string;
  content: string;
}

function StatsCard({ icon, title, content }: StatsCardProps) {
  return (
    <div className="flex-1 bg-muted rounded-lg text-muted-foreground p-4">
      <span className="mb-2 flex items-center gap-2">
        {icon} <span className="text-lg font-medium">{title}</span>
      </span>
      <span className="text-xl font-bold text-foreground">{content}</span>
    </div>
  );
}

function Profile() {
  const navigate = useNavigate();
  const user = useUser();

  const {
    profile: userProfile,
    leaderboard,
    buyer,
    seller,
  } = useLoaderData<ProfileLoader>();
  const userPoints = userProfile.points;
  const userStatus = userProfile.status;

  const statusImages: Record<UserStatus, string> = {
    Новичок: newbyeStatus,
    Внимательный: attentiveStatus,
    Бдительный: vigilantStatus,
    'Эксперт безопасности': securityExpertStatus,
  };

  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(
    USER_STATUS_CODES[userStatus],
  );

  useEffect(() => {
    if (!api) return;

    // Перемещаемся к слайду текущего статуса
    api.scrollTo(USER_STATUS_CODES[userStatus]);
  }, [api, userStatus]);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrentSlide(api.selectedScrollSnap());
    };

    api.on('select', onSelect);

    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  const isStatusReached = (userStatus: UserStatus, status: UserStatus) =>
    USER_STATUS_CODES[userStatus] >= USER_STATUS_CODES[status];

  const isCurrentStatusReached = isStatusReached(
    userStatus,
    USER_STATUSES[currentSlide],
  );
  const nextStatus: UserStatus =
    USER_STATUSES[USER_STATUS_CODES[userStatus] + 1] ?? USER_STATUSES.at(-1);
  let pointsForNextStatus = USER_STATUSES_START_POINTS[nextStatus] - userPoints;

  if (pointsForNextStatus < 0) pointsForNextStatus = 0;

  return (
    <>
      <NavigationBar points={userPoints} status={userStatus} />

      <div className="container-box">
        <div className="bg-background px-5 py-4 sm:px-8 sm:py-6 rounded-lg flex flex-col gap-4 sm:gap-8">
          <div className="flex items-center gap-6">
            <span className="text-3xl font-bold text-background bg-primary size-20 flex items-center justify-center rounded-full">
              {userProfile.user.name[0]}
            </span>
            <h2 className="text-2xl font-bold">{userProfile.user.name}</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <StatsCard
              icon={<CircleStar />}
              title="Очки"
              content={String(userPoints)}
            />
            <StatsCard
              icon={<TargetIcon />}
              title="Пройдено"
              content={`${userProfile.completedEasyScenarios + userProfile.completedHardScenarios} / ${buyer.length + seller.length}`}
            />
          </div>
        </div>
      </div>

      <div className="container-box">
        <div className="bg-background px-5 py-4 sm:px-8 sm:py-6 rounded-lg flex flex-col gap-4 sm:gap-8">
          <h3 className="text-xl font-semibold">Статусы</h3>

          <Carousel
            opts={{
              align: 'center', // Центрирует активный слайд
              containScroll: false, // Разрешает пустое место в начале и конце карусели
            }}
            setApi={setApi}
            className="select-none px-12"
          >
            <CarouselContent>
              {Object.entries(statusImages).map(([status, img], i) => (
                <CarouselItem
                  key={status}
                  className={`md:basis-1/2 lg:basis-1/3 transition-transform ${currentSlide === i || 'scale-80'}`}
                >
                  <img
                    className="aspect-square"
                    src={
                      isStatusReached(userStatus, status as UserStatus)
                        ? img
                        : closedStatus
                    }
                    alt={status}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="cursor-pointer" size="lg" />
            <CarouselNext className="cursor-pointer" size="lg" />
          </Carousel>

          <div className="flex items-center justify-center gap-3">
            {isCurrentStatusReached && (
              <CircleCheck className="size-6 sm:size-8 text-primary" />
            )}
            <h2
              className={`text-center text-xl sm:text-3xl font-bold ${isCurrentStatusReached || 'text-muted-foreground'}`}
            >
              {USER_STATUSES[currentSlide]}
            </h2>
          </div>

          <div className="flex flex-col gap-2 sm:gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base font-medium text-muted-foreground">
                До ранга "{nextStatus}"
              </span>
              <span className="text-base font-bold text-right">
                {pointsForNextStatus} очков
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full flex items-center">
              <span
                className={`inline-block h-full rounded-full bg-primary`}
                style={{
                  width: `${(userPoints / (userPoints + pointsForNextStatus)) * 100}%`,
                }}
              ></span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-box">
        <div className="bg-background px-5 py-4 sm:px-8 sm:py-6 rounded-lg flex flex-col gap-4 sm:gap-8">
          <h3 className="text-xl font-semibold">Таблица рейтинга</h3>

          <Table className="text-sm border-separate border-spacing-y-1">
            <TableHeader className="font-medium">
              <TableRow className="flex items-center border-none rounded-2xl h-12">
                <TableHead className="w-[20%] sm:w-[15%] pl-2 flex items-center">
                  Место
                </TableHead>
                <TableHead className="w-[50%] sm:w-[55%] flex items-center">
                  Пользователь
                </TableHead>
                <TableHead className="w-[30%] flex items-center justify-end">
                  Очки
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard
                .sort((a, b) => a.rank - b.rank)
                .map(row => (
                  <Fragment key={row.rank}>
                    {row.user.id === user?.id && row.rank > 4 ? (
                      <TableRow className="hover:bg-transparent">
                        <TableCell className="w-full text-xl font-bold text-muted-foreground text-center">
                          ...
                        </TableCell>
                      </TableRow>
                    ) : null}
                    <TableRow
                      className={`flex items-center rounded-2xl ${
                        row.user.id === user?.id
                          ? 'bg-primary/10 border! border-primary hover:bg-primary/20'
                          : 'border border-transparent'
                      }`}
                    >
                      <TableCell className="w-[20%] sm:w-[15%] pl-6 font-medium">
                        {row.rank}
                      </TableCell>
                      <TableCell className="w-[50%] sm:w-[55%] flex flex-col">
                        <span className="font-semibold">
                          {row.user.name} {row.user.id === user?.id && '(вы)'}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">
                          {row.status}
                        </span>
                      </TableCell>
                      <TableCell className="w-[30%] font-bold text-right">
                        {row.points}
                      </TableCell>
                    </TableRow>
                  </Fragment>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="container-box pb-12 flex items-center justify-center">
        <Button
          className="text-md px-8 py-6 cursor-pointer"
          variant="outline"
          onClick={() => {
            clearUser();
            localStorage.removeItem(AUTH_STORAGE_KEY);
            void navigate('/login');
          }}
        >
          Выйти из аккаунта
        </Button>
      </div>
    </>
  );
}

export default Profile;
