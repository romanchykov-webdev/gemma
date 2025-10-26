"use client";

import React, { useEffect, useState } from "react";
import { Container } from "./container";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import ReactStories from "react-insta-stories";
import { Api } from "../../../services/api-client";
import { IStory } from "../../../services/stories";
import { LazyImage } from "./lazy-image";

interface Props {
	className?: string;
}

export const Stories: React.FC<Props> = ({ className }) => {
	const [stories, setStories] = useState<IStory[]>([]);
	const [open, setOpen] = useState(false);
	const [selectedStory, setSelectedStory] = useState<IStory>();

	useEffect(() => {
		const timer = setTimeout(async () => {
			const data = await Api.stories.getAll();
			setStories(data);
		}, 2000);

		return () => clearTimeout(timer);
	}, []);

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

			{stories.map((story, index) => (
				<div key={story.id} className="py-5">
					<LazyImage
						key={story.id}
						src={story.previewImageUrl}
						alt={`Story ${story.id}`}
						width={200}
						height={250}
						className=" cursor-pointer rounded-md overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
						priority={index === 0}
						quality={70}
						onClick={() => onClickStory(story)}
					/>
				</div>
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
