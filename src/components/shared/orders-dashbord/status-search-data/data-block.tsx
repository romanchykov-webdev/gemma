'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import React, { JSX, useState, useEffect } from 'react';

interface Props {
  className?: string;
  selectedDate?: string; // ISO формат YYYY-MM-DD
  onDateChange: (date: Date) => void;
}

export const DataBlock: React.FC<Props> = ({ className, selectedDate, onDateChange }): JSX.Element => {
  // Устанавливаем начальную дату (всегда используем selectedDate или сегодня)
  const [date, setDate] = useState<Date>(() => {
    if (selectedDate) {
      return new Date(selectedDate);
    }
    // Возвращаем сегодняшнюю дату
    return new Date();
  });

  // Обновляем локальное состояние при изменении selectedDate
  useEffect(() => {
    if (selectedDate) {
      setDate(new Date(selectedDate));
    }
  }, [selectedDate]);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      onDateChange(newDate);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'flex items-center bg-white gap-2 px-4 h-16 w-full sm:w-auto whitespace-nowrap dark:bg-input/30',
            className,
          )}
        >
          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">{format(date, 'PPP', { locale: it })}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar mode="single" selected={date} onSelect={handleDateSelect} />
      </PopoverContent>
    </Popover>
  );
};
