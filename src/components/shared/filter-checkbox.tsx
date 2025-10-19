import React, { JSX } from 'react';
import { Checkbox } from '@/components/ui';
// ⬆️ Импортируем уже готовый UI-компонент Checkbox из твоей библиотеки компонентов

// Типы (props), которые принимает твой компонент
export interface FilterChecboxProps {
  text: string; // текст, который будет отображаться рядом с чекбоксом
  value: string; // значение чекбокса (например, "cheese" или "pepperoni")
  endAdornment?: React.ReactNode; // необязательный элемент справа (например, иконка или счетчик)
  onCheckedChange?: (checked: boolean) => void; // колбэк, вызывается при изменении состояния чекбокса
  checked?: boolean; // управляемое состояние — отмечен чекбокс или нет
  name?: string; // имя группы чекбоксов (для идентификации)
}

// Сам компонент
export const FilterCheckbox: React.FC<FilterChecboxProps> = ({
  text,
  value,
  endAdornment,
  onCheckedChange,
  checked,
  name,
}): JSX.Element => {
  return (
    <div className="flex items-center space-x-2">
      {/* Сам чекбокс */}
      <Checkbox
        onCheckedChange={onCheckedChange} // функция, вызывается при клике (true/false)
        checked={checked} // состояние чекбокса (управляется снаружи)
        value={value} // значение чекбокса
        className="rounded-[8px] w-6 h-6" // кастомные стили Tailwind (квадратный с закруглением 8px)
        id={`checkbox-${String(name)}-${String(value)}`} // уникальный id, чтобы связать чекбокс и label
      />

      {/* Подпись к чекбоксу */}
      <label
        htmlFor={`checkbox-${String(name)}-${String(value)}`} // связывает label с конкретным чекбоксом
        className="leading-none cursor-pointer flex-1"
      >
        {text}
      </label>

      {/* Дополнительный элемент справа (иконка, число и т.д.), если передали */}
      {endAdornment}
    </div>
  );
};
