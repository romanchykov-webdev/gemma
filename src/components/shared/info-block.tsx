import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import { Title } from "./title";

interface Props {
	title: string;
	text: string;
	className?: string;
	imageUrl?: string;
}

export const InfoBlock: React.FC<Props> = ({ className, title, text, imageUrl }) => {
	return (
		<div
			className={cn(
				className,
				"flex flex-col md:flex-row items-center justify-between w-full max-w-[840px] gap-8 md:gap-12 px-4 ",
			)}
		>
			<div className="flex flex-col">
				<div className="w-full md:max-w-[445px]">
					<Title size="lg" text={title} className="font-extrabold" />
					<p className="text-gray-400 text-lg">{text}</p>
				</div>

				<div className="flex flex-row gap-3  pb-10 pt-10 ">
					<Link href="/">
						<Button variant="outline" className="gap-2">
							<ArrowLeft />
							На главную
						</Button>
					</Link>
					<a href="">
						<Button variant="outline" className="text-gray-500 border-gray-400 hover:bg-gray-50">
							Обновить
						</Button>
					</a>
				</div>
			</div>

			{imageUrl && (
				<img src={imageUrl} alt={title} className="w-full max-w-[300px] h-auto object-contain pb-10" />
			)}
		</div>
	);
};
