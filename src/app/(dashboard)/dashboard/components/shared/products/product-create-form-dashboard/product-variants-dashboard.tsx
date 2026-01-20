import { Button, Input } from '@/components/ui';
import { Trash2 } from 'lucide-react';
import React from 'react';

export interface ProductVariant {
  sizeId: number | null;
  doughTypeId: number | null;
  price: number;
}

interface Props {
  variants: ProductVariant[];
  availableSizes: { id: number; name: string; value: number }[];
  availableDoughTypes: { id: number; name: string; value: number }[];
  showVariants: boolean;
  setShowVariants: (val: boolean) => void;
  addVariant: () => void;
  removeVariant: (index: number) => void;
  updateVariant: (index: number, field: keyof ProductVariant, value: number | null) => void;
  loadingOptions: boolean;
  isCreating: boolean;
}

export const ProductVariantsDashboard: React.FC<Props> = ({
  variants,
  availableSizes,
  availableDoughTypes,
  showVariants,
  setShowVariants,
  addVariant,
  removeVariant,
  updateVariant,
  loadingOptions,
  isCreating,
}) => {
  return (
    <div className="border-t pt-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">
          Varianti {variants.length > 0 && `(${variants.length})`}
        </span>
        <div className="flex gap-2">
          {variants.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowVariants(!showVariants)}
              disabled={isCreating}
            >
              {showVariants ? 'Nascondi' : 'Mostra'}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addVariant}
            disabled={
              isCreating ||
              loadingOptions ||
              availableSizes.length === 0 ||
              availableDoughTypes.length === 0
            }
          >
            Aggiungi Variante
          </Button>
        </div>
      </div>

      {loadingOptions && (
        <div className="text-sm text-gray-500 text-center py-2">
          Caricamento formati e tipi di impasto...
        </div>
      )}

      {showVariants &&
        variants.map((variant, index) => (
          <div key={index} className="flex items-center gap-2 bg-white p-3 rounded-lg border">
            <select
              value={variant.sizeId ?? availableSizes[0]?.id}
              onChange={e => updateVariant(index, 'sizeId', Number(e.target.value))}
              disabled={isCreating || availableSizes.length === 0}
            >
              {availableSizes.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} - {s.value} cm
                </option>
              ))}
            </select>
            <select
              value={variant.doughTypeId ?? availableDoughTypes[0]?.id}
              onChange={e => updateVariant(index, 'doughTypeId', Number(e.target.value))}
              disabled={isCreating || availableDoughTypes.length === 0}
            >
              {availableDoughTypes.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <Input
              type="number"
              placeholder="Prezzo €"
              value={variant.price || ''}
              onChange={e => updateVariant(index, 'price', Number(e.target.value))}
              disabled={isCreating}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeVariant(index)}
              disabled={isCreating}
            >
              <Trash2 />
            </Button>
          </div>
        ))}
    </div>
  );
};
