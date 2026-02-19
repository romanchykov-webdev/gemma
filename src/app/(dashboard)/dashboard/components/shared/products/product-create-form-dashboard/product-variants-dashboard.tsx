import { Button, Input } from '@/components/ui';
import { Trash2 } from 'lucide-react';
import React from 'react';

// 🔄 REFACTOR: Используем typeId вместо doughTypeId
export interface ProductVariantUI {
  sizeId: number | null;
  typeId: number | null; // БЫЛО: doughTypeId
  price: number;
}

interface Props {
  variants: ProductVariantUI[];
  availableSizes: { id: number; name: string; value: number }[];
  availableDoughTypes: { id: number; name: string; value: number }[];
  showVariants: boolean;
  setShowVariants: (val: boolean) => void;
  addVariant: () => void;
  removeVariant: (index: number) => void;
  updateVariant: (index: number, field: keyof ProductVariantUI, value: number | null) => void;
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

      {showVariants && (
        <div className="space-y-3">
          {variants.map((variant, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row items-start md:items-center gap-2 bg-white p-3 rounded-lg border"
            >
              {/* Выбор размера */}
              <div className="w-full md:w-1/3">
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={variant.sizeId ?? availableSizes[0]?.id}
                  onChange={e => updateVariant(index, 'sizeId', Number(e.target.value))}
                  disabled={isCreating || availableSizes.length === 0}
                >
                  {availableSizes.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.value} cm)
                    </option>
                  ))}
                </select>
              </div>

              {/* Выбор теста */}
              <div className="w-full md:w-1/3">
                {/* 🔄 REFACTOR: Привязка к typeId */}
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={variant.typeId ?? availableDoughTypes[0]?.id}
                  onChange={e => updateVariant(index, 'typeId', Number(e.target.value))}
                  disabled={isCreating || availableDoughTypes.length === 0}
                >
                  {availableDoughTypes.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Цена */}
              <div className="w-full md:w-1/4">
                <Input
                  type="number"
                  placeholder="Prezzo €"
                  value={variant.price || ''}
                  onChange={e => updateVariant(index, 'price', Number(e.target.value))}
                  disabled={isCreating}
                />
              </div>

              <div className="w-full md:w-auto flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeVariant(index)}
                  disabled={isCreating}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
