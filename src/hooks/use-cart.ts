import { CartStateItem } from '@/lib/get-cart-details';
import { useCartStore } from '@/store/cart';
// import { useEffect } from "react";
import { useEffect, useRef } from 'react';
import { CreateCartItemValuesOptimistic } from '../../services/dto/cart.dto';
type CountType = 'plus' | 'minus';

// type ReturnType = {
// 	totalAmount: number;
// 	items: CartStateItem[];
// 	loading: boolean;
// 	updateItemQuantity: (id: number, quantity: number) => void;
// 	removeCartItem: (id: number) => void;
// 	addCartItem: (values: CreateCartItemValues) => void;
// 	changeItemCount: (id: number, currentQty: number, type: CountType) => void;
// };
type UseCartReturn = {
  totalAmount: number;
  items: CartStateItem[];
  loading: boolean;
  syncing: boolean; // ✅ Флаг синхронизации с сервером
  updateItemQuantity: (id: string, quantity: number) => void; // UUID
  removeCartItem: (id: string) => void; // UUID
  addCartItem: (values: CreateCartItemValuesOptimistic) => void;
  changeItemCount: (id: string, currentQty: number, type: CountType) => void; // UUID
  refetchCart: () => Promise<void>; // ✅ Принудительная загрузка для checkout
};
export const useCart = (): UseCartReturn => {
  //
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map()); // UUID
  const pendingQtyRef = useRef<Map<string, number>>(new Map()); // UUID
  const DEBOUNCE_MS = 300;
  //
  const totalAmount = useCartStore(state => state.totalAmount);

  const items = useCartStore(state => state.items);

  const updateItemQuantity = useCartStore(state => state.updateItemQuantity);

  const loading = useCartStore(state => state.loading);

  const syncing = useCartStore(state => state.syncing); // ✅ Флаг синхронизации

  const removeCartItem = useCartStore(state => state.removeCartItem);

  const addCartItem = useCartStore(state => state.addCartItem);

  const refetchCart = useCartStore(state => state.refetchCart); // ✅ Принудительная загрузка
  //

  useEffect(() => {
    const timers = timersRef.current;
    const pendings = pendingQtyRef.current;

    return () => {
      for (const t of timers.values()) clearTimeout(t);
      timers.clear();
      pendings.clear();
    };
  }, []);

  // ❌ УДАЛЕНО: Больше не загружаем корзину при каждом монтировании
  // Корзина загружается один раз в providers.tsx
  // useEffect(() => {
  //   fetchCartItems();
  // }, [fetchCartItems]);

  // const changeItemCount = (id: number, currentQty: number, type: CountType) => {
  // 	const next = type === "plus" ? currentQty + 1 : currentQty - 1;

  // 	if (next < 1) {
  // 		updateItemQuantity(id, 1);
  // 		return;
  // 	}

  // 	updateItemQuantity(id, next);
  // };
  const changeItemCount = (id: string, currentQty: number, type: CountType) => {
    // базой берём "ожидаемое" значение, если уже есть серия кликов; иначе текущее из стора
    const base = pendingQtyRef.current.get(id) ?? currentQty;
    const next = type === 'plus' ? base + 1 : base - 1;

    // не даём уйти ниже 1
    const clamped = Math.max(1, next);

    // сохранить ожидаемое значение
    pendingQtyRef.current.set(id, clamped);

    // перезапустить таймер для этого товара
    const prev = timersRef.current.get(id);
    if (prev) clearTimeout(prev);

    const timer = setTimeout(() => {
      const finalQty = pendingQtyRef.current.get(id) ?? 1;
      updateItemQuantity(id, finalQty);

      // очистка
      pendingQtyRef.current.delete(id);
      timersRef.current.delete(id);
    }, DEBOUNCE_MS);

    timersRef.current.set(id, timer);
  };

  return {
    totalAmount,
    items,
    updateItemQuantity,
    loading,
    syncing, // ✅ Флаг синхронизации
    removeCartItem,
    addCartItem,
    changeItemCount,
    refetchCart, // ✅ Принудительная загрузка
  };
};
