import { cn } from '@/lib/utils';
import React, { JSX } from 'react';

interface Props {
  className?: string;
  tuttiCount: number;
  inAttesaCount: number;
  completatiCount: number;
  activeStatus: string;
  onStatusChange: (status: string) => void;
}

interface StatusItemProps {
  title: string;
  count: number;
  isActive?: boolean;
  onClick: () => void;
}

const StatusItem = ({ title, count, isActive = false, onClick }: StatusItemProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-2 cursor-pointer py-5 rounded-tl-md rounded-tr-md ',
        'hover:bg-brand-primary/50 hover:text-white transition-all duration-300',
        isActive ? 'bg-brand-primary text-white' : 'bg-surface-gray text-brand-primary',
      )}
    >
      <h6>{title}</h6>
      <h6>({count})</h6>
    </div>
  );
};

export const StatusBlock: React.FC<Props> = ({
  className,
  tuttiCount,
  inAttesaCount,
  completatiCount,
  activeStatus,
  onStatusChange,
}): JSX.Element => {
  return (
    <div className={cn('border-b border-brand-primary', className)}>
      <div className="grid grid-cols-3 gap-1">
        <StatusItem
          isActive={activeStatus === 'ALL'}
          title="Tutti"
          count={tuttiCount}
          onClick={() => onStatusChange('ALL')}
        />
        <StatusItem
          isActive={activeStatus === 'PENDING'}
          title="In attesa"
          count={inAttesaCount}
          onClick={() => onStatusChange('PENDING')}
        />
        <StatusItem
          isActive={activeStatus === 'SUCCEEDED'}
          title="Pronti"
          count={completatiCount}
          onClick={() => onStatusChange('SUCCEEDED')}
        />
      </div>
    </div>
  );
};
