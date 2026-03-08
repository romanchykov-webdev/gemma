'use client';

import { Api } from '@/../services/api-client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  CreateProductSizeData,
  ProductSize,
  UpdateProductSizeData,
} from '../components/shared/product-sizes/product-size-types';
import {
  isDuplicateName,
  validateProductSizeData,
} from '../components/shared/product-sizes/product-size-utils';

import { getErrorMessage } from '../lib/utils/api-error';

interface UseProductSizesReturn {
  sizes: ProductSize[];
  loading: boolean;
  isCreating: boolean;
  loadingProductSizeIds: Set<number>;
  loadSizes: () => Promise<void>;
  handleCreate: (data: CreateProductSizeData) => Promise<boolean>;
  handleUpdate: (id: number, data: UpdateProductSizeData) => Promise<boolean>;
  handleDelete: (id: number) => Promise<boolean>;
}

export const useProductSizes = (): UseProductSizesReturn => {
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [loadingProductSizeIds, setLoadingProductSizeIds] = useState<Set<number>>(new Set());

  const loadSizes = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);

      const data = await Api.product_sizes_dashboard.getProductSizes({ signal });
      if (!signal?.aborted) {
        setSizes(data);
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'CanceledError') return;
      if (!signal?.aborted) {
        toast.error('Errore nel caricamento delle dimensioni');
        console.error(error);
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  const sizesRef = useRef(sizes);
  useEffect(() => {
    sizesRef.current = sizes;
  }, [sizes]);

  useEffect(() => {
    const controller = new AbortController();
    loadSizes(controller.signal);
    return () => controller.abort();
  }, [loadSizes]);

  const handleCreate = async (data: CreateProductSizeData): Promise<boolean> => {
    const validationError = validateProductSizeData(data);
    if (validationError) {
      toast.error(validationError);
      return false;
    }

    if (isDuplicateName(data.name, sizesRef.current)) {
      toast.error('Esiste già una dimensione con questo nome');
      return false;
    }

    try {
      setIsCreating(true);
      const created = await Api.product_sizes_dashboard.createProductSize(data);
      setSizes(prev => [created, ...prev]);
      toast.success('Dimensione creata con successo');
      return true;
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Errore nella creazione della dimensione'));
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (id: number, data: UpdateProductSizeData): Promise<boolean> => {
    const validationError = validateProductSizeData(data);
    if (validationError) {
      toast.error(validationError);
      return false;
    }

    if (isDuplicateName(data.name, sizesRef.current, id)) {
      toast.error('Esiste già una dimensione con questo nome');
      return false;
    }

    try {
      setLoadingProductSizeIds(prev => new Set(prev).add(id));
      const updated = await Api.product_sizes_dashboard.updateProductSize(id, data);
      setSizes(prev => prev.map(s => (s.id === id ? updated : s)));
      toast.success('Dimensione aggiornata');
      return true;
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Errore nell'aggiornamento"));
      return false;
    } finally {
      setLoadingProductSizeIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleDelete = async (id: number): Promise<boolean> => {
    try {
      setLoadingProductSizeIds(prev => new Set(prev).add(id));
      await Api.product_sizes_dashboard.deleteProductSize(id);
      setSizes(prev => prev.filter(s => s.id !== id));
      toast.success('Dimensione eliminata');
      return true;
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Errore nell'eliminazione"));
      return false;
    } finally {
      setLoadingProductSizeIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return {
    sizes,
    loading,
    isCreating,
    loadingProductSizeIds,

    loadSizes,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
};
