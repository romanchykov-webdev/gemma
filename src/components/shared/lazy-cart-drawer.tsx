'use client';

import React, { Suspense, lazy } from 'react';

const CartDrawer = lazy(() =>
  import('./cart-drawer').then(module => ({ default: module.CartDrawer })),
);

export const LazyCartDrawer: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Suspense fallback={children}>
      <CartDrawer>{children}</CartDrawer>
    </Suspense>
  );
};
