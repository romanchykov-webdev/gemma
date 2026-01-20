'use client';

import { Button, Select } from '@/components/ui';
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import React from 'react';
import { DoughType, ProductItem, ProductSize } from '../product-types';

interface Props {
  variants: ProductItem[];
  sizes: ProductSize[];
  doughTypes: DoughType[];
  onChange: (variants: ProductItem[]) => void;
}

export const ProductVariantsEditTable: React.FC<Props> = ({
  variants,
  sizes,
  doughTypes,
  onChange,
}) => {
  // update variant price
  const updateVariantPrice = (index: number, newPrice: number) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], price: newPrice };
    onChange(updated);
  };

  // update variant size
  const updateVariantSize = (index: number, newSizeId: number) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], sizeId: newSizeId };
    onChange(updated);
  };

  // update variant dough type
  const updateVariantDoughType = (index: number, newDoughTypeId: number) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], doughTypeId: newDoughTypeId };
    onChange(updated);
  };

  // remove variant
  const removeVariant = (index: number) => {
    onChange(variants.filter((_, i) => i !== index));
  };

  // add variant
  const addVariant = () => {
    const newVariant: ProductItem = {
      id: Date.now(), // временный ID
      price: 0,
      sizeId: sizes[0]?.id || null,
      doughTypeId: doughTypes[0]?.id || null,
    };
    onChange([...variants, newVariant]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">Varianti del prodotto</h4>
        <Button type="button" size="sm" variant="outline" onClick={addVariant}>
          Aggiungi variante
        </Button>
      </div>

      <div className="space-y-2">
        {variants.map((variant, index) => {
          const size = sizes.find(s => s.id === variant.sizeId);
          const doughType = doughTypes.find(d => d.id === variant.doughTypeId);

          return (
            <div
              key={variant.id}
              className="flex items-center gap-2 bg-gray-50 p-2 rounded border justify-between"
            >
              <div className="flex gap-2 flex-wrap">
                {/* <span className="text-sm">
									{size?.name || "N/A"} - {doughType?.name || "N/A"}
								</span> */}
                {/* select size */}
                <Select
                  value={variant.sizeId?.toString()}
                  onValueChange={value => updateVariantSize(index, Number(value))}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder={size?.name || 'N/A'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>{size?.name || 'N/A'}</SelectLabel>
                      {sizes.map(s => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {/* select types */}
                <Select
                  value={variant.doughTypeId?.toString()}
                  onValueChange={value => updateVariantDoughType(index, Number(value))}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder={doughType?.name || 'N/A'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>{doughType?.name || 'N/A'}</SelectLabel>
                      {doughTypes.map(t => (
                        <SelectItem key={t.id} value={t.id.toString()}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 justify-center">
                  <input
                    type="number"
                    value={Number(variant.price) || ''}
                    onChange={e => updateVariantPrice(index, Number(e.target.value))}
                    className="w-24 px-2 py-1 border rounded text-sm"
                    placeholder="Prezzo"
                    step="0.01"
                    min="0"
                  />
                  <span className="text-sm">€</span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => removeVariant(index)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {variants.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          Nessuna variante. Aggiungi almeno una variante.
        </p>
      )}
    </div>
  );
};
