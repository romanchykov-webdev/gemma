import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  spinnerSize?: number;
  spinnerClassName?: string;
  className?: string;
}

export const LoadingOverlay = ({
  isVisible,
  spinnerSize = 50,
  spinnerClassName = 'text-white',
  className,
}: LoadingOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'absolute inset-0 flex items-center justify-center bg-gray-500/50 z-10',
        className,
      )}
    >
      <Loader2 size={spinnerSize} className={cn('animate-spin', spinnerClassName)} />
    </div>
  );
};
