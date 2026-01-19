"use client";

import { cn } from "@/lib/utils";
import { useCartStore } from "@/store";
import React, { JSX, useEffect, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { LazyCartDrawer } from "./lazy-cart-drawer";

interface Props {
	className?: string;
}

export const CartButtonSticky: React.FC<Props> = ({ className }): JSX.Element => {
	const items = useCartStore((state) => state.items);
	const itemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

	// Состояние: ушел ли хедер из поля зрения
	const [isHeaderOffScreen, setIsHeaderOffScreen] = useState(false);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				setIsHeaderOffScreen(!entry.isIntersecting);
			},
			{
				threshold: 0,
				rootMargin: "0px",
			},
		);

		const header = document.querySelector("header");
		if (header) observer.observe(header);

		return () => observer.disconnect();
	}, []);

	// Показываем кнопку только если есть товары И хедер скрыт
	const isVisible = itemsCount > 0 && isHeaderOffScreen;

	return (
		<AnimatePresence>
			{/* Кнопка отображается только есть товары */}
			{isVisible && (
				<LazyCartDrawer>
					<motion.button
						initial={{ scale: 0, opacity: 0, y: 20 }}
						animate={{ scale: 1, opacity: 1, y: 0 }}
						exit={{ scale: 0, opacity: 0, y: 20 }}
						whileTap={{ scale: 0.9 }} // Эффект нажатия
						className={cn(
							"fixed bottom-8 right-6 z-[50] md:hidden flex items-center justify-center",
							className,
						)}
					>
						{/* Основной круг кнопки */}
						<div className="relative bg-[#FF6B00] p-5 rounded-full shadow-[0_10px_25px_rgba(255,107,0,0.4)] border-2 border-white">
							<ShoppingCart size={28} color="white" strokeWidth={2.5} />

							{/* Баббл с количеством товаров  */}
							{itemsCount > 0 && (
								<span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
									{itemsCount}
								</span>
							)}
						</div>

						{/* Пульсирующий фон для привлечения внимания (опционально) */}
						<span className="absolute inset-0 rounded-full bg-[#FF6B00] animate-ping opacity-20 -z-10"></span>
					</motion.button>
				</LazyCartDrawer>
			)}
		</AnimatePresence>
	);
};
