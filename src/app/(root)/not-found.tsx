"use client";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link"; // Импортируем Link
import notFoundImage from "../../../public/assets/images/not-found.png";

// Создаем анимированный Link
const MotionLink = motion.create(Link);

export default function NotFoundPage() {
	return (
		<div className="flex flex-col items-center justify-center relative  mt-10 md:h-screen md:mt-0">
			<AnimatePresence>
				<MotionLink
					href="/"
					initial={{ scale: 0, opacity: 0, y: 20 }}
					animate={{ scale: 1, opacity: 1, y: 0 }}
					exit={{ scale: 0, opacity: 0, y: 20 }}
					whileTap={{ scale: 0.95 }}
					className={cn("relative mb-10 flex items-center justify-center")}
				>
					{/* Пульсирующий фон */}
					<span className="absolute inset-0 rounded-full bg-[#FF6B00] animate-ping opacity-25" />

					{/* Контент кнопки */}
					<div className="relative z-10 bg-[#FF6B00] p-5 rounded-full shadow-[0_10px_25px_rgba(255,107,0,0.4)] border-2 border-white">
						<span className="text-white text-xl md:text-2xl font-bold px-6">Torna alla home page</span>
					</div>
				</MotionLink>
			</AnimatePresence>
			<h1>404 - Pagina non trovata</h1>
			<p className="mb-8">La pagina che stai cercando non esiste.</p>

			<Image
				src={notFoundImage}
				alt="404 - Page not found"
				width={300}
				height={300}
				className="object-cover mb-4"
			/>
		</div>
	);
}
