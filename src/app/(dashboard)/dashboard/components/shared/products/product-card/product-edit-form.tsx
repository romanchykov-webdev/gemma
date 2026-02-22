'use client';

import { Button, Input } from '@/components/ui';
import { slugify } from '@/lib/slugify'; // 👈 Добавляем импорт
import { Check, ImageIcon, X } from 'lucide-react';
import React, { useState } from 'react';
import { ImageUpload } from '../../image-upload';
import { ProductVariantsEditTable } from '../product-create-form-dashboard/product-variants-edit-table';
import { UniversalIngredientsSelector } from '../product-create-form-dashboard/universal-ingredients-selector';
import {
  Category,
  DoughType,
  Ingredient,
  Product,
  ProductSize,
  UpdateProductData,
} from '../product-types';

import Image from 'next/image';
import { LoadingOverlay } from '../../loading-overlay';

interface Props {
  product: Product;
  categories: Category[];
  ingredients: Ingredient[];
  sizes: ProductSize[];
  doughTypes: DoughType[];
  onSave: (data: UpdateProductData) => void;
  onCancel: () => void;
}

export const ProductEditForm: React.FC<Props> = ({
  product,
  categories,
  ingredients,
  sizes,
  doughTypes,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(product.name);
  const [imageUrl, setImageUrl] = useState(product.imageUrl);
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [variants, setVariants] = useState(product.variants);
  const [isUploading, setIsUploading] = useState(false);

  // ========== ЛОГИКА ДЛЯ ПУТЕЙ И ИМЕН ==========
  const currentCategory = categories.find(c => c.id === categoryId);
  const uploadFolder = slugify(currentCategory?.name ?? 'products');
  // const uploadFileName = name.trim() ? slugify(name) : undefined;
  const uploadFileName = name.trim() ? name : undefined;

  // ... (остальные стейты и методы)
  const [baseIngredients, setBaseIngredients] = useState<
    Array<{ id: number; removable: boolean; isDisabled: boolean }>
  >(
    product.baseIngredients?.map(ing => ({
      id: ing.id,
      removable: ing.removable,
      isDisabled: ing.isDisabled,
    })) || [],
  );
  const [addableIngredientIds, setAddableIngredientIds] = useState<number[]>(
    product.addableIngredientIds || [],
  );

  const toggleBaseIngredient = (id: number) => {
    setBaseIngredients(prev => {
      const exists = prev.some(ing => ing.id === id);
      if (exists) return prev.filter(ing => ing.id !== id);
      return [...prev, { id, removable: true, isDisabled: false }];
    });
  };

  const toggleRemovable = (id: number) => {
    setBaseIngredients(prev =>
      prev.map(ing => (ing.id === id ? { ...ing, removable: !ing.removable } : ing)),
    );
  };

  const toggleAddableIngredient = (id: number) => {
    setAddableIngredientIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  };

  const handleSubmit = () => {
    const enrichedBaseIngredients = baseIngredients
      .map(selected => {
        const ing = ingredients.find(i => i.id === selected.id);
        if (!ing) return null;
        return {
          id: ing.id,
          name: ing.name,
          imageUrl: ing.imageUrl,
          removable: selected.removable,
          isDisabled: selected.isDisabled,
        };
      })
      .filter((ing): ing is NonNullable<typeof ing> => ing !== null);

    onSave({
      name: name.trim(),
      imageUrl: imageUrl.trim(),
      categoryId,
      previousImageUrl: product.imageUrl,
      baseIngredients: enrichedBaseIngredients.length > 0 ? enrichedBaseIngredients : undefined,
      addableIngredientIds: addableIngredientIds.length > 0 ? addableIngredientIds : [],
      variants: variants.map(v => ({
        variantId: v.variantId,
        price: Number(v.price),
        sizeId: v.sizeId,
        typeId: v.typeId,
      })),
    });
  };

  return (
    <div className="bg-white border rounded-lg p-4 space-y-4 shadow-sm relative overflow-hidden">
      {/* loading overlay */}
      <LoadingOverlay isVisible={isUploading} className="z-20" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-3">
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nome prodotto..."
          />
          <ImageUpload
            imageUrl={imageUrl}
            onImageChange={setImageUrl}
            folder={uploadFolder}
            customFileName={uploadFileName}
            label="Immagine prodotto"
            required
            isUploading={isUploading}
            setIsUploading={setIsUploading}
          />
        </div>

        <div className="flex items-center justify-center">
          {imageUrl ? (
            <div className="relative flex p-2 w-full items-center justify-center h-full min-h-[200px] border rounded-lg overflow-hidden bg-gray-50">
              <Image
                src={imageUrl}
                alt="Preview"
                width={300}
                height={300}
                className="max-h-48 w-auto object-contain drop-shadow-md"
              />
              <Button
                type="button"
                onClick={() => setImageUrl('')}
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2 opacity-80 hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed w-full h-full min-h-[200px] flex flex-col items-center justify-center rounded-lg p-8 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
              <ImageIcon className="h-10 w-10 mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-500 font-medium">Anteprima immagine</p>
            </div>
          )}
        </div>
      </div>

      <select
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        value={categoryId}
        onChange={e => setCategoryId(Number(e.target.value))}
      >
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <ProductVariantsEditTable
        variants={variants}
        sizes={sizes}
        doughTypes={doughTypes}
        onChange={setVariants}
      />

      <UniversalIngredientsSelector
        mode="base"
        title="Ingredienti Base"
        description="Gli ingredienti che compongono il prodotto di default."
        availableIngredients={ingredients}
        selectedIngredients={baseIngredients}
        onToggleIngredient={toggleBaseIngredient}
        onToggleRemovable={toggleRemovable}
        isCreating={false}
      />

      <UniversalIngredientsSelector
        mode="addable"
        title="Ingredienti Aggiuntivi"
        description="Ingredienti extra che il cliente può aggiungere a pagamento."
        availableIngredients={ingredients}
        selectedIngredientIds={addableIngredientIds}
        onToggle={toggleAddableIngredient}
        isCreating={false}
      />

      <div className="flex gap-2 pt-4 mt-6">
        <Button
          onClick={handleSubmit}
          disabled={isUploading || !name.trim() || !imageUrl.trim()}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        >
          <Check className="w-4 h-4 mr-2" />
          Salva modifiche
        </Button>
        <Button onClick={onCancel} variant="outline" className="flex-1">
          <X className="w-4 h-4 mr-2" />
          Annulla
        </Button>
      </div>
    </div>
  );
};
