'use client';

import { Button } from '@/components/ui';
import { slugify } from '@/lib/slugify';
import { Check, X } from 'lucide-react';
import React, { useState } from 'react';
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

import { LoadingOverlay } from '../../loading-overlay';

import { ProductImageSection } from '../product-image-section';

import { useIngredientsSelection } from '@/app/(dashboard)/dashboard/hooks';

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

  const {
    baseIngredients,
    addableIngredientIds,
    toggleBaseIngredient,
    toggleRemovable,
    toggleAddableIngredient,
    enrichedBaseIngredients,
  } = useIngredientsSelection({
    availableIngredients: ingredients,

    initialBaseIngredients:
      product.baseIngredients?.map(ing => ({
        id: ing.id,
        removable: ing.removable,
        isDisabled: ing.isDisabled,
      })) || [],
    initialAddableIngredientIds: product.addableIngredientIds || [],
  });

  const handleSubmit = () => {
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

      <ProductImageSection
        name={name}
        onNameChange={setName}
        imageUrl={imageUrl}
        onImageChange={setImageUrl}
        uploadFolder={uploadFolder}
        uploadFileName={uploadFileName}
        isUploading={isUploading}
        onUploadingChange={setIsUploading}
      />

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
