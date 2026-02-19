'use client';

import { Button, Input } from '@/components/ui';
import { ImageIcon, Loader2, Plus, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { ImageUpload } from '../../image-upload';
import { Category, CreateProductData, DoughType, Ingredient, ProductSize } from '../product-types';
import { BaseIngredientsSelector } from './base-ingredients-selector';
import { ProductIngredientsDashboard } from './product-ingredients-dashboard';
import { ProductVariantsDashboard } from './product-variants-dashboard';

interface Props {
  categories: Category[];
  ingredients: Ingredient[];
  sizes: ProductSize[];
  doughTypes: DoughType[];
  onSubmit: (data: CreateProductData) => Promise<void>;
}

export const ProductCreateFormDashboard: React.FC<Props> = ({
  categories,
  ingredients,
  sizes,
  doughTypes,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 0);

  // 🔄 Варианты продукта
  const [variants, setVariants] = useState<
    { sizeId: number | null; typeId: number | null; price: number }[]
  >([]);
  const [showVariants, setShowVariants] = useState(false);

  // 🔄 Базовые ингредиенты (которые УЖЕ входят в продукт)
  const [baseIngredients, setBaseIngredients] = useState<
    Array<{ id: number; removable: boolean; isDisabled: boolean }>
  >([]);
  const [showBaseIngredients, setShowBaseIngredients] = useState(false);

  // 🔄 Дополнительные ингредиенты (которые пользователь может добавить за доплату)
  const [addableIngredientIds, setAddableIngredientIds] = useState<number[]>([]);
  const [showAddableIngredients, setShowAddableIngredients] = useState(false);

  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // ========== Методы для вариантов ==========
  const addVariant = () => {
    const defaultSizeId = sizes[0]?.id || null;
    const defaultTypeId = doughTypes[0]?.id || null;

    setVariants([...variants, { sizeId: defaultSizeId, typeId: defaultTypeId, price: 0 }]);
    setShowVariants(true);
  };

  const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));

  const updateVariant = (
    index: number,
    field: keyof (typeof variants)[0],
    value: number | null,
  ) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  // ========== Методы для базовых ингредиентов ==========
  const addBaseIngredient = (id: number) => {
    setBaseIngredients(prev => [
      ...prev,
      { id, removable: true, isDisabled: false }, // Дефолтные значения
    ]);
  };

  const removeBaseIngredient = (id: number) => {
    setBaseIngredients(prev => prev.filter(ing => ing.id !== id));
  };

  const toggleRemovable = (id: number) => {
    setBaseIngredients(prev =>
      prev.map(ing => (ing.id === id ? { ...ing, removable: !ing.removable } : ing)),
    );
  };

  const toggleDisabled = (id: number) => {
    setBaseIngredients(prev =>
      prev.map(ing => (ing.id === id ? { ...ing, isDisabled: !ing.isDisabled } : ing)),
    );
  };

  // ========== Методы для дополнительных ингредиентов ==========
  const toggleAddableIngredient = (id: number) => {
    setAddableIngredientIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  };

  // ========== Создание продукта ==========
  const handleCreate = async () => {
    if (!name.trim()) return toast.error('Inserisci il nome del prodotto');
    if (!imageUrl.trim()) return toast.error("Inserisci l'URL dell'immagine");
    if (!categoryId) return toast.error('Seleziona una categoria');
    if (variants.length > 0 && variants.some(v => !v.price || v.price <= 0)) {
      return toast.error('Inserisci un prezzo valido per tutte le varianti');
    }

    try {
      setIsCreating(true);

      // ✅ 1. Собираем полные объекты базовых ингредиентов
      const enrichedBaseIngredients = baseIngredients.map(selected => {
        const ing = ingredients.find(i => i.id === selected.id)!;
        return {
          id: ing.id,
          name: ing.name,
          imageUrl: ing.imageUrl,
          removable: selected.removable, // ✅ Из состояния
          isDisabled: selected.isDisabled, // ✅ Из состояния
        };
      });

      // ✅ 2. Формируем варианты с variantId и typeId
      const formattedVariants = variants.map((v, index) => ({
        variantId: index + 1,
        price: Number(v.price),
        sizeId: v.sizeId ?? undefined,
        typeId: v.typeId ?? undefined,
      }));

      await onSubmit({
        name: name.trim(),
        imageUrl: imageUrl.trim(),
        categoryId,
        baseIngredients: enrichedBaseIngredients.length > 0 ? enrichedBaseIngredients : undefined,
        addableIngredientIds: addableIngredientIds.length > 0 ? addableIngredientIds : [],
        variants: formattedVariants.length > 0 ? formattedVariants : undefined,
      });

      // Очистка формы после успешного создания
      setName('');
      setImageUrl('');
      setCategoryId(categories[0]?.id || 0);
      setVariants([]);
      setBaseIngredients([]);
      setAddableIngredientIds([]);
      setShowVariants(false);
      setShowBaseIngredients(false);
      setShowAddableIngredients(false);
    } catch (error: unknown) {
      console.error('Error creating product:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border space-y-3 relative overflow-hidden">
      {isUploading && (
        <div className="absolute top-0 left-0 w-full h-full bg-gray-500/50 flex items-center justify-center">
          <Loader2 size={50} className=" animate-spin" />
        </div>
      )}
      <h3 className="font-semibold">Aggiungi nuovo prodotto</h3>

      {/* Основные поля */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* form */}
        <div className="flex flex-col gap-3">
          <Input
            placeholder="Nome prodotto..."
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={isCreating}
          />
          <Input
            placeholder="URL immagine..."
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            disabled={isCreating}
          />
          <ImageUpload
            imageUrl={imageUrl}
            onImageChange={setImageUrl}
            folder="products"
            label="Immagine prodotto"
            required
            isUploading={isUploading}
            setIsUploading={setIsUploading}
          />
        </div>

        {/* Preview */}
        <div className="flex items-center justify-center ">
          {imageUrl ? (
            <div className="relative flex p-5 w-full item-center justify-center h-60 border rounded overflow-hidden bg-gray-100">
              <img src={imageUrl} alt="Preview" className=" h-50 object-cover" />
              <Button
                type="button"
                onClick={() => setImageUrl('')}
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed w-full h-full flex flex-col items-center justify-center rounded p-8 text-center">
              <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Preview image</p>
            </div>
          )}
        </div>
      </div>

      {/* Категории */}
      <div className="flex gap-2">
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={categoryId}
          onChange={e => setCategoryId(Number(e.target.value))}
          disabled={isCreating}
        >
          <option value={0}>Seleziona categoria...</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Варианты продукта */}
      <ProductVariantsDashboard
        variants={variants}
        availableSizes={sizes}
        availableDoughTypes={doughTypes}
        showVariants={showVariants}
        setShowVariants={setShowVariants}
        addVariant={addVariant}
        removeVariant={removeVariant}
        updateVariant={updateVariant}
        loadingOptions={false}
        isCreating={isCreating}
      />

      {/* Базовые ингредиенты (которые УЖЕ входят в продукт) */}
      <BaseIngredientsSelector
        availableIngredients={ingredients}
        selectedIngredients={baseIngredients}
        onAdd={addBaseIngredient}
        onRemove={removeBaseIngredient}
        onToggleRemovable={toggleRemovable}
        onToggleDisabled={toggleDisabled}
        showSelector={showBaseIngredients}
        setShowSelector={setShowBaseIngredients}
        isCreating={isCreating}
      />

      {/* Дополнительные ингредиенты (которые пользователь может добавить за доплату) */}
      <ProductIngredientsDashboard
        availableIngredients={ingredients}
        selectedIngredientIds={addableIngredientIds}
        toggleIngredient={toggleAddableIngredient}
        showIngredients={showAddableIngredients}
        setShowIngredients={setShowAddableIngredients}
        isCreating={isCreating}
      />

      <Button
        onClick={handleCreate}
        disabled={isCreating || !name.trim() || !imageUrl.trim() || !categoryId}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        {isCreating ? 'Creazione...' : 'Aggiungi Prodotto'}
      </Button>
    </div>
  );
};
