"use client";

import React, { useEffect, useState } from "react";
import { Container } from "./container";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import Image from "next/image";
import ReactStories from "react-insta-stories";
import { Api } from "../../../services/api-client";
import { IStory } from "../../../services/stories";

interface Props {
	className?: string;
}

export const Stories: React.FC<Props> = ({ className }) => {
	const [stories, setStories] = useState<IStory[]>([]);
	const [open, setOpen] = useState(false);
	const [selectedStory, setSelectedStory] = useState<IStory>();

	const [shouldLoad, setShouldLoad] = useState(false);

	// Загружаем Stories только после mount (не блокируем SSR)
	useEffect(() => {
		const timer = setTimeout(() => setShouldLoad(true), 500); // Задержка 500ms
		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		if (!shouldLoad) return;
		async function fetchStories() {
			const data = await Api.stories.getAll();
			setStories(data);
		}

		fetchStories();
	}, [shouldLoad]);

	const onClickStory = (story: IStory) => {
		setSelectedStory(story);
		if (story.items.length > 0) setOpen(true);
	};

	return (
		<Container className={cn("flex items-center justify-between gap-2 my-10 overflow-x-auto", className)}>
			{(!stories || stories.length === 0) &&
				[...Array(6)].map((_, index) => (
					<div key={index} className="w-[200px] h-[250px] bg-gray-200 rounded-md animate-pulse" />
				))}

			{stories.map((story) => (
				// <img
				// 	key={story.id}
				// 	onClick={() => onClickStory(story)}
				// 	className="rounded-md cursor-pointer"
				// 	height={250}
				// 	width={200}
				// 	src={story.previewImageUrl}
				// 	alt={`Story ${story.id}`}
				// 	loading="lazy"
				// />
				<Image
					key={story.id}
					onClick={() => onClickStory(story)}
					className="rounded-md cursor-pointer"
					height={250}
					width={200}
					src={story.previewImageUrl}
					alt={`Story ${story.id}`}
					priority={false}
					quality={70}
				/>
			))}

			{open && (
				<div
					onClick={() => setOpen(false)}
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
				>
					<div
						onClick={(e) => e.stopPropagation()}
						className="relative w-[80vw] h-[80vh] max-w-[520px] max-h-[800px]"
					>
						<button className="absolute -right-2 -top-10 z-50" onClick={() => setOpen(false)}>
							<X className="w-8 h-8 text-white/70 hover:text-white transition-colors" />
						</button>

						<ReactStories
							onAllStoriesEnd={() => setOpen(false)}
							stories={selectedStory?.items.map((item) => ({ url: item.sourceUrl })) || []}
							defaultInterval={3000}
							width="100%"
							height="100%"
						/>
					</div>
				</div>
			)}
		</Container>
	);
};
