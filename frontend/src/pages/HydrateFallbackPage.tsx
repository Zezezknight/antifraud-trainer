import { Spinner } from '@/components/ui/spinner';
import '../style.css';

function HydrateFallbackPage() {
  return (
    <div className="bg-background flex justify-center items-center h-screen">
      <Spinner className="size-12 text-primary" />
    </div>
  );
}

export default HydrateFallbackPage;
