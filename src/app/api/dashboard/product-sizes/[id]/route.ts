import { revalidateProductVariants } from '@/lib/revalidate-product';
import { verifyDashboardPermissions } from '@/lib/verify-dashboard-permissions';
import { NextRequest, NextResponse } from 'next/server';
import { ProductVariant } from '../../../../../../@types/prisma';
import { prisma } from '../../../../../../prisma/prisma-client';
// PATCH
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  // 🛡️ защита
  const permissionError = await verifyDashboardPermissions();
  if (permissionError) return permissionError;
  try {
    const { params } = context;
    const { id: idStr } = await params;
    const id = Number(idStr);
    const data = await req.json();

    if (!id || isNaN(id)) {
      return NextResponse.json({ message: 'ID non valido' }, { status: 400 });
    }

    // пример логики обновления (сделайте свою, как было у вас)
    const existing = await prisma.size.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: 'Formato non trovato' }, { status: 404 });
    }

    const updateData: { name?: string; value?: number; sortOrder?: number } = {};
    if (data.name) updateData.name = data.name.trim();
    if (data.value !== undefined) updateData.value = Number(data.value);
    if (data.sortOrder !== undefined) updateData.sortOrder = Number(data.sortOrder);

    const updated = await prisma.size.update({
      where: { id },
      data: updateData,
      // include: { _count: { select: { productItems: true } } },
    });

    // ✅ Инвалидируем кеш размеров и главную страницу
    await revalidateProductVariants();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PRODUCT_SIZE_PATCH] Error:', error);
    return NextResponse.json({ message: "Errore nell'aggiornamento" }, { status: 500 });
  }
}

// DELETE
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  // 🛡️ защита
  const permissionError = await verifyDashboardPermissions();
  if (permissionError) return permissionError;
  try {
    const { params } = context;
    const { id: idStr } = await params;
    const id = Number(idStr);

    if (!id || isNaN(id)) {
      return NextResponse.json({ message: 'ID non valido' }, { status: 400 });
    }

    const existing = await prisma.size.findUnique({
      where: { id },
      // include: { _count: { select: { productItems: true } } },
    });

    if (!existing) {
      return NextResponse.json({ message: 'Formato non trovato' }, { status: 404 });
    }

    // Проверка использования в продуктах
    const allProducts = await prisma.product.findMany({
      select: {
        id: true,
        variants: true,
      },
    });

    const productsUsingSize = allProducts.filter(product => {
      if (!Array.isArray(product.variants)) return false;
      const variants = product.variants as unknown as ProductVariant[];
      return variants.some(variant => variant.sizeId === id);
    });

    if (productsUsingSize.length > 0) {
      return NextResponse.json(
        {
          message: `Impossibile eliminare. Il formato è usato da ${productsUsingSize.length} prodotti`,
        },
        { status: 400 },
      );
    }

    // if (existing._count.productItems > 0) {
    // 	return NextResponse.json(
    // 		{ message: `Impossibile eliminare. Il formato è usato da ${existing._count.productItems} prodotti` },
    // 		{ status: 400 },
    // 	);
    // }

    await prisma.size.delete({ where: { id } });

    // ✅ Инвалидируем кеш размеров и главную страницу
    await revalidateProductVariants();

    return NextResponse.json({ message: 'Formato eliminato con successo' });
  } catch (error) {
    console.error('[PRODUCT_SIZE_DELETE] Error:', error);
    return NextResponse.json({ message: "Errore nell'eliminazione" }, { status: 500 });
  }
}
