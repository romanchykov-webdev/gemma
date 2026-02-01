import { cn } from '@/lib/utils';
import React, { JSX } from 'react';

interface Props {
  className?: string;
  tuttiCount: number;
  inAttesaCount: number;
  completatiCount: number;
}

interface StatusItemProps {
  title: string;
  count: number;
  isActive?: boolean;
}
const StatusItem = ({ title, count, isActive = false }: StatusItemProps) => {
  return (
    <div
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
}): JSX.Element => {
  return (
    <div className={cn('border-b border-brand-primary', className)}>
      <div className="grid grid-cols-3 gap-1">
        <StatusItem isActive={true} title="Tutti" count={tuttiCount} />
        <StatusItem isActive={false} title="In attesa" count={inAttesaCount} />
        <StatusItem isActive={false} title="Pronti" count={completatiCount} />
      </div>
    </div>
  );
};
