'use client';

import { cn } from '@/lib/utils';
import React from 'react';
import { useProducts } from '../../hooks/use-products';
import { ProductCardDashboard } from './products/product-card/product-card';
import { ProductCategoryFilter } from './products/product-category-filter';
import { ProductCreateFormDashboard } from './products/product-create-form-dashboard/product-create-form';

interface Props {
  className?: string;
}

export const ProductsDashboard: React.FC<Props> = ({ className }) => {
  // Hooks
  const {
    categories,
    products,
    loading,
    selectedCategoryId,
    ingredients,
    sizes,
    doughTypes,
    loadingProductIds,
    setSelectedCategoryId,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useProducts();

  // Loading state (initial load)
  if (loading && categories.length === 0) {
    return (
      <div className={cn('p-6', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Заголовок */}
      <div>
        <h2 className="text-2xl font-bold">Gestione Prodotti</h2>
        <p className="text-gray-500 text-sm mt-1">Totale: {products.length} prodotti</p>
      </div>

      {/* Фильтр по категориям */}
      <ProductCategoryFilter
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={setSelectedCategoryId}
      />

      {/* Форма создания */}
      <ProductCreateFormDashboard
        categories={categories}
        ingredients={ingredients}
        sizes={sizes}
        doughTypes={doughTypes}
        onSubmit={handleCreate}
      />

      {/* Список продуктов */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Caricamento...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Nessun prodotto trovato</p>
          <p className="text-sm mt-2">
            {selectedCategoryId
              ? 'Questa categoria non contiene prodotti'
              : 'Inizia creando il tuo primo prodotto'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {products.map(product => (
            <ProductCardDashboard
              key={product.id}
              product={product}
              categories={categories}
              ingredients={ingredients}
              sizes={sizes}
              doughTypes={doughTypes}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              isLoading={loadingProductIds.has(product.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
