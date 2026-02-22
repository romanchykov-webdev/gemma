'use client';

import { Button } from '@/components/ui';
import { Loader2, Plus } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { slugify } from '@/lib/slugify';
import { Category, CreateProductData, DoughType, Ingredient, ProductSize } from '../product-types';
import { ProductVariantsDashboard } from './product-variants-dashboard';
import { UniversalIngredientsSelector } from './universal-ingredients-selector';

import { useIngredientsSelection } from '@/app/(dashboard)/dashboard/hooks';
import { LoadingOverlay } from '../../loading-overlay';
import { ProductImageSection } from '../product-image-section';

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

  const [variants, setVariants] = useState<
    { sizeId: number | null; typeId: number | null; price: number }[]
  >([]);
  const [showVariants, setShowVariants] = useState(false);

  const {
    baseIngredients,
    addableIngredientIds,
    toggleBaseIngredient,
    toggleRemovable,
    toggleAddableIngredient,
    resetIngredients,
    enrichedBaseIngredients,
  } = useIngredientsSelection({ availableIngredients: ingredients });

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

  const handleCreate = async () => {
    if (!name.trim()) return toast.error('Inserisci il nome del prodotto');
    if (!imageUrl.trim()) return toast.error("Carica l'immagine del prodotto");
    if (!categoryId) return toast.error('Seleziona una категория');

    try {
      setIsCreating(true);

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
      resetIngredients();
      setShowVariants(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border space-y-3 relative overflow-hidden">
      {/* loading overlay */}
      <LoadingOverlay isVisible={isUploading} className="z-20" />

      <h3 className="font-semibold">Aggiungi nuovo prodotto</h3>

      <ProductImageSection
        name={name}
        onNameChange={setName}
        nameDisabled={isCreating}
        imageUrl={imageUrl}
        onImageChange={setImageUrl}
        uploadFolder={uploadFolder}
        uploadFileName={uploadFileName}
        isUploading={isUploading}
        onUploadingChange={setIsUploading}
      />

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
