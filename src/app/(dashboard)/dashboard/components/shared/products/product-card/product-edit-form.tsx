'use client';

import { Button, Input } from '@/components/ui';
import { Check, X } from 'lucide-react';
import React, { useState } from 'react';
import { ProductIngredientsDashboard } from '../product-create-form-dashboard/product-ingredients-dashboard';
import { ProductVariantsEditTable } from '../product-create-form-dashboard/product-variants-edit-table';
import {
  Category,
  DoughType,
  Ingredient,
  Product,
  ProductSize,
  UpdateProductData,
} from '../product-types';

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
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<number[]>(
    product.baseIngredients?.map(ing => ing.id) || [],
  );
  const [variants, setVariants] = useState(product.variants);
  const [showIngredients, setShowIngredients] = useState(false);

  // console.log(ProductEditForm, { product, categories, ingredients, sizes, doughTypes });

  const handleSubmit = () => {
    onSave({
      name: name.trim(),
      imageUrl: imageUrl.trim(),
      categoryId,
      // ✅ Преобразуем selectedIngredientIds в baseIngredients
      baseIngredients: ingredients
        .filter(ing => selectedIngredientIds.includes(ing.id))
        .map(ing => ({
          id: ing.id,
          name: ing.name,
          imageUrl: ing.imageUrl,
          removable: true,
          isDisabled: false,
        })),
      addableIngredientIds: [],
      variants: variants.map(v => ({
        variantId: v.variantId,
        price: Number(v.price),
        sizeId: v.sizeId,
        typeId: v.typeId,
      })),
    });
  };

  const toggleIngredient = (id: number) => {
    setSelectedIngredientIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  };

  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nome" />
        <Input
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value)}
          placeholder="URL immagine"
        />
      </div>

      <select
        className="flex h-10 w-full rounded-md border px-3"
        value={categoryId}
        onChange={e => setCategoryId(Number(e.target.value))}
      >
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* Варианты продукта */}
      <ProductVariantsEditTable
        variants={variants}
        sizes={sizes}
        doughTypes={doughTypes}
        onChange={setVariants}
      />

      {/* Выбор ингредиентов */}
      <ProductIngredientsDashboard
        availableIngredients={ingredients}
        selectedIngredientIds={selectedIngredientIds}
        toggleIngredient={toggleIngredient}
        showIngredients={showIngredients}
        setShowIngredients={setShowIngredients}
        isCreating={false}
      />

      <div className="flex gap-2">
        <Button onClick={handleSubmit} className="flex-1 bg-green-600">
          <Check className="w-4 h-4 mr-1" />
          Salva
        </Button>
        <Button onClick={onCancel} variant="outline" className="flex-1">
          <X className="w-4 h-4 mr-1" />
          Annulla
        </Button>
      </div>
    </div>
  );
};
