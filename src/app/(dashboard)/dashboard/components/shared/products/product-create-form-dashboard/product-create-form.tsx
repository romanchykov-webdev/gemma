'use client';

import { Button, Input } from '@/components/ui';
import { ImageIcon, Loader2, Plus, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { slugify } from '@/lib/slugify'; // 👈 Добавляем импорт
import Image from 'next/image';
import { ImageUpload } from '../../image-upload';
import { Category, CreateProductData, DoughType, Ingredient, ProductSize } from '../product-types';
import { ProductVariantsDashboard } from './product-variants-dashboard';
import { UniversalIngredientsSelector } from './universal-ingredients-selector';

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

  // ========== ЛОГИКА ДЛЯ ПУТЕЙ И ИМЕН ==========
  const currentCategory = categories.find(c => c.id === categoryId);
  const uploadFolder = slugify(currentCategory?.name ?? 'products');
  // const uploadFileName = name.trim() ? slugify(name) : undefined;
  const uploadFileName = name.trim() ? name : undefined;

  // ... (остальные стейты и методы без изменений)
  const [variants, setVariants] = useState<
    { sizeId: number | null; typeId: number | null; price: number }[]
  >([]);
  const [showVariants, setShowVariants] = useState(false);
  const [baseIngredients, setBaseIngredients] = useState<
    Array<{ id: number; removable: boolean; isDisabled: boolean }>
  >([]);
  const [addableIngredientIds, setAddableIngredientIds] = useState<number[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleCreate = async () => {
    if (!name.trim()) return toast.error('Inserisci il nome del prodotto');
    if (!imageUrl.trim()) return toast.error("Carica l'immagine del prodotto");
    if (!categoryId) return toast.error('Seleziona una категория');

    try {
      setIsCreating(true);

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

      setName('');
      setImageUrl('');
      setCategoryId(categories[0]?.id || 0);
      setVariants([]);
      setBaseIngredients([]);
      setAddableIngredientIds([]);
      setShowVariants(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border space-y-3 relative overflow-hidden">
      {isUploading && (
        <div className="absolute top-0 left-0 w-full h-full bg-gray-500/50 flex items-center justify-center z-20">
          <Loader2 size={50} className=" animate-spin text-white" />
        </div>
      )}
      <h3 className="font-semibold">Aggiungi nuovo prodotto</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col gap-3">
          <Input
            placeholder="Nome prodotto..."
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={isCreating}
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

        <div className="flex items-center justify-center ">
          {imageUrl ? (
            <div className="relative flex p-5 w-full item-center justify-center h-60 border rounded overflow-hidden bg-gray-100">
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

      <UniversalIngredientsSelector
        mode="base"
        title="Ingredienti Base"
        description="Gli ingredienti che compongono il prodotto di default."
        availableIngredients={ingredients}
        selectedIngredients={baseIngredients}
        onToggleIngredient={toggleBaseIngredient}
        onToggleRemovable={toggleRemovable}
        isCreating={isCreating}
      />

      <UniversalIngredientsSelector
        mode="addable"
        title="Ingredienti Aggiuntivi"
        description="Ingredienti extra che il cliente può aggiungere a pagamento."
        availableIngredients={ingredients}
        selectedIngredientIds={addableIngredientIds}
        onToggle={toggleAddableIngredient}
        isCreating={isCreating}
      />

      <Button
        onClick={handleCreate}
        disabled={isCreating || isUploading || !name.trim() || !imageUrl.trim() || !categoryId}
        className="w-full mt-4"
      >
        {isCreating ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Plus className="w-4 h-4 mr-2" />
        )}
        {isCreating ? 'Creazione...' : 'Aggiungi Prodotto'}
      </Button>
    </div>
  );
};
