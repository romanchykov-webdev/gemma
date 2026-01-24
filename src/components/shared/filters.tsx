'use client';

import { CheckboxFiltersGroup } from '@/components/shared/checkbox-filters-group';
import { RangeSlider } from '@/components/shared/range-slider';
import { Title } from '@/components/shared/title';
import { Input } from '@/components/ui';
import { DEFAULT_MAX_PRICE, DEFAULT_MIN_PRICE } from '@/constants/pizza';
import { useFilters, useIngredients, useQueryFilters } from '@/hooks';
import { cn } from '@/lib/utils';
import { useProductsStore } from '@/store';
import React, { JSX, useEffect } from 'react';

interface IFiltersProps {
  className?: string;
  enabled?: boolean;
}

export const Filters: React.FC<IFiltersProps> = ({ className, enabled = true }): JSX.Element => {
  const { ingredients, loading } = useIngredients(enabled);
  const filters = useFilters();

  // ✅ Триггерим клиентскую фильтрацию
  const filterProducts = useProductsStore(state => state.filterProducts);

  // ⚡ Применяем фильтры МГНОВЕННО на клиенте
  useEffect(() => {
    filterProducts(filters);
  }, [filters, filterProducts]);

  // ✅ Обновляем URL для sharable links (без перезагрузки страницы!)
  useQueryFilters(filters);

  const items = ingredients.map(item => ({ value: String(item.id), text: item.name }));

  const updatePrices = (prices: number[]) => {
    filters.setPrices('priceFrom', prices[0]);
    filters.setPrices('priceTo', prices[1]);
  };

  return (
    <div className={cn('', className)}>
      <div className="flex items-center justify-between  mb-5">
        <Title text="Filtrazione" size="sm" className=" font-bold" />
      </div>
      <div className="flex flex-col gap-4">
        {/*selected impasto*/}
        <CheckboxFiltersGroup
          title="Tipo di test"
          className="mt-5"
          name="impasto"
          items={[
            { text: 'tradizionale', value: '1' },
            { text: 'sottile', value: '2' },
          ]}
          onClickCheckbox={filters.setPizzaTypes}
          selected={filters.pizzaTypes}
        />
        {/*selected size*/}
        <CheckboxFiltersGroup
          title="Dimensioni"
          className="mt-5"
          name="size"
          items={[
            { text: '20 cm', value: '1' },
            { text: '30 cm', value: '2' },
            { text: '40 cm', value: '3' },
          ]}
          onClickCheckbox={filters.setSizes}
          selected={filters.sizes}
        />
      </div>

      {/* Фильтр цен */}
      <div className="mt-5 border-y border-y-neutral-100 py-6 pb-7">
        <p className="font-bold mb-3">Prezzo da e per:</p>
        <div className="flex gap-3 mb-5">
          <Input
            type="number"
            placeholder="0"
            min={DEFAULT_MIN_PRICE}
            max={DEFAULT_MAX_PRICE}
            value={filters.prices.priceFrom ? String(filters.prices.priceFrom) : ''}
            onChange={e => filters.setPrices('priceFrom', Number(e.target.value))}
          />
          <Input
            type="number"
            placeholder="0"
            min={DEFAULT_MIN_PRICE}
            max={DEFAULT_MAX_PRICE}
            value={filters.prices.priceTo ? String(filters.prices.priceTo) : ''}
            onChange={e => filters.setPrices('priceTo', Number(e.target.value))}
          />
        </div>

        <RangeSlider
          min={0}
          max={DEFAULT_MAX_PRICE}
          step={1}
          value={[filters.prices.priceFrom || 0, filters.prices.priceTo || 20]}
          onValueChange={updatePrices}
        />
      </div>
      <CheckboxFiltersGroup
        title="Ingredienti:"
        className="mt-5"
        name="ingredients"
        limit={3}
        defaultItems={items.slice(0, 6)}
        items={items}
        loading={loading}
        onClickCheckbox={filters.setSelectedIngredients}
        selected={filters.selectedIngredients}
      />
    </div>
  );
};
