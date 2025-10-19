'use client';
import clsx from 'clsx';
import React from 'react';

// Определяем допустимые размеры заголовка
type TitleSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Интерфейс пропсов для компонента Title
interface Props {
  size?: TitleSize; // Размер заголовка, необязательный. По умолчанию 'sm'
  className?: string; // Дополнительные CSS классы, которые можно передать
  text: string; // Сам текст заголовка
}

// Компонент Title
export const Title: React.FC<Props> = ({ text, size = 'sm', className }) => {
  // Сопоставляем каждый размер заголовка с соответствующим HTML тегом
  const mapTagBySize = {
    xs: 'h5',
    sm: 'h4',
    md: 'h3',
    lg: 'h2',
    xl: 'h1',
    '2xl': 'h1', // Два самых больших размера используют h1
  } as const;

  // Сопоставляем каждый размер с классами Tailwind (размер шрифта)
  const mapClassNameBySize = {
    xs: 'text-[16px]',
    sm: 'text-[22px]',
    md: 'text-[26px]',
    lg: 'text-[32px]',
    xl: 'text-[40px]',
    '2xl': 'text-[48px]',
  } as const;

  // Создаем элемент React динамически
  // React.createElement(tag, props, children)
  // tag: выбираем тег заголовка в зависимости от размера
  // props: объединяем классы через clsx (можно добавить дополнительные классы через className)
  // children: текст заголовка
  return React.createElement(
    mapTagBySize[size], // тег: h1, h2, h3 и т.д.
    { className: clsx(mapClassNameBySize[size], className) }, // классы
    text, // текст заголовка
  );
};
