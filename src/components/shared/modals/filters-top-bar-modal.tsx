'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import React from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  className?: string;
  sortList: { value: string; label: string }[];
  selected: string;
  handleSelect: (value: string) => void;
}

export const FiltersTopBarModal: React.FC<Props> = ({
  open,
  onClose,
  sortList,
  className,
  selected,
  handleSelect,
}) => {
  return (
    <div
      className={cn(
        'fixed right-5 lg:top-70 sm:top-110 w-56 rounded-xl border bg-white shadow-lg ',
        className,
      )}
      role="listbox"
    >
      <ul className="py-1">
        {sortList.map(opt => {
          const active = opt.value === selected;
          return (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-50',
                  active && 'text-primary',
                )}
                role="option"
                aria-selected={active}
              >
                <Check
                  size={16}
                  className={cn('opacity-0', active && 'opacity-100 text-primary')}
                />
                <span>{opt.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
