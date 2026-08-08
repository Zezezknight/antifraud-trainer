import NavigationBar from '@/components/NavigationBar';
import type { ProfileLoader } from '@/loaders/profile';
import { useLoaderData } from 'react-router';
import { CircleStar, TargetIcon } from 'lucide-react';

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
  const {
    profile: userProfile,
    leaderboard,
    buyer,
    seller,
  } = useLoaderData<ProfileLoader>();

  console.log(buyer, seller, leaderboard);

  return (
    <>
      <NavigationBar points={userProfile.points} status={userProfile.status} />
      <div className="container px-8 mx-auto">
        <div className="bg-background px-8 py-6 rounded-lg flex flex-col gap-8">
          <div className="flex items-center gap-6">
            <span className="text-3xl font-bold text-background bg-primary size-20 flex items-center justify-center rounded-full">
              {userProfile.user.name[0]}
            </span>
            <span className="text-2xl font-bold">{userProfile.user.name}</span>
          </div>

          <div className="flex gap-3">
            <StatsCard
              icon={<CircleStar />}
              title="Очки"
              content={String(userProfile.points)}
            />
            <StatsCard
              icon={<TargetIcon />}
              title="Пройдено"
              content={`${userProfile.completedEasyScenarios + userProfile.completedHardScenarios} / ${buyer.length + seller.length}`}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
