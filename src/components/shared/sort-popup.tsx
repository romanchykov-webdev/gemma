'use client';
import { cn } from '@/lib/utils';
import { ArrowUpDown } from 'lucide-react';
import React, { JSX, useEffect, useState } from 'react';
import { FiltersTopBarModal } from './modals';

interface ISortPopupProps {
  className?: string;

  value?: string;
  onChange?: (value: string) => void;
}

const sortList = [
  { value: 'none', label: 'Nessuno' },
  { value: 'popular', label: 'Popolare' },
  { value: 'priceDown', label: 'Prezzo ↓' },
  { value: 'priceUp', label: 'Prezzo ↑' },
  { value: 'new', label: 'Novità' },
  { value: 'discount', label: 'In promozione' },
];

export const SortPopup: React.FC<ISortPopupProps> = ({
  className,
  value,
  onChange,
}): JSX.Element => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string>(value ?? 'none');

  useEffect(() => {
    if (typeof value === 'string') setSelected(value);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const current = sortList.find(s => s.value === selected) ?? sortList[0];

  const handleSelect = (v: string) => {
    setSelected(v);
    onChange?.(v);
    setOpen(false);
  };

  return (
    <div className={cn('relative inline-block', className)}>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className={cn(
          'inline-flex items-center gap-1 bg-gray-50 px-5 h-[52px] rounded-2xl md:text-sm',
          'border border-transparent hover:border-gray-200 transition-colors',
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <ArrowUpDown size={16} />
        <b>Ordina per:</b>
        <b className="text-primary min-w-20">{current.label}</b>
      </button>

      {/*  */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {open && (
        <FiltersTopBarModal
          open={open}
          onClose={() => setOpen(false)}
          sortList={sortList}
          selected={selected}
          className="z-50"
          handleSelect={handleSelect}
        />
      )}
    </div>
  );
};
