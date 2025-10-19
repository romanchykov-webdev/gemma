"use client";

import { Button } from "@/components/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

// Функция для получения значения куки
// function getCookie(name: string): string | undefined {
// 	const value = `; ${document.cookie}`;
// 	const parts = value.split(`; ${name}=`);
// 	if (parts.length === 2) return parts.pop()?.split(";").shift();
// 	return undefined;
// }

const SuccessContent = () => {
	const params = useSearchParams();
	const router = useRouter();
	const sessionId = params.get("session_id");
	const [secondsLeft, setSecondsLeft] = useState(5);

	useEffect(() => {
		const tick = setInterval(() => {
			setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
		}, 1000);

		const toHome = setTimeout(() => {
			router.replace("/");
		}, 5000);

		return () => {
			clearInterval(tick);
			clearTimeout(toHome);
		};
	}, [router]);

	return (
		<div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
			<h1 className="text-3xl font-bold mb-4">Спасибо за заказ 🎉</h1>
			{sessionId ? (
				<div>
					<p className="text-lg text-neutral-600 mb-4">
						Ваша оплата прошла успешно. Мы уже начинаем готовить ваш заказ!
					</p>
					<p className="text-sm text-neutral-500">Сейчас перенаправим на главную через {secondsLeft} сек…</p>
				</div>
			) : (
				<div>
					<p className="text-lg text-neutral-600 mb-4">
						Мы уже начинаем готовить ваш заказ! Скоро мы его доставим.
					</p>
					<p className="text-sm text-neutral-500">Сейчас перенаправим на главную через {secondsLeft} сек…</p>
				</div>
			)}

			<Button
				variant="default"
				onClick={() => router.replace("/")}
				className="mt-6 inline-flex items-center rounded-md px-4 py-2 "
			>
				На главную
			</Button>
		</div>
	);
};

export default function CheckoutSuccessPage() {
	return (
		<Suspense fallback={<div className="flex min-h-[70vh] items-center justify-center">Загрузка…</div>}>
			<SuccessContent />
		</Suspense>
	);
}
