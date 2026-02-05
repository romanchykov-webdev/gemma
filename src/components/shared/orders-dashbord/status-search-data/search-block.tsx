'use client';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import React, { JSX } from 'react';

interface Props {
  className?: string;
  onSearch?: (value: string) => void;
}

export const SearchBlock: React.FC<Props> = ({ className, onSearch }): JSX.Element => {
  return (
    <div className={cn('flex-1 w-full sm:w-auto relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        placeholder="Search"
        className="pl-10 h-16 bg-white dark:bg-input/30 w-full sm:min-w-[200px]"
        onChange={e => onSearch?.(e.target.value)}
      />
    </div>
  );
};
