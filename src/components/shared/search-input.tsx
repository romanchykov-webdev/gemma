"use client";

import { cn } from "@/lib/utils";
import { Product } from "@prisma/client";
import { Loader2, Search } from "lucide-react";
import Link from "next/link";
import React, { JSX, useRef, useState } from "react";
import { useClickAway, useDebounce } from "react-use";
import { Api } from "../../../services/api-client";

interface ISearchInputProps {
	className?: string;
}

export const SearchInput: React.FC<ISearchInputProps> = (): JSX.Element => {
	const [focused, setFocused] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [products, setProducts] = useState<Product[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const ref = useRef(null);

	useClickAway(ref, () => {
		setFocused(false);
	});

	const onClickItem = () => {
		setProducts([]);
		setSearchQuery("");
		setFocused(false);
	};

	useDebounce(
		async () => {
			try {
				setIsLoading(true);
				const response = await Api.products.search(searchQuery);
				setProducts(response);
				// console.log("SearchInput");
			} catch (err) {
				console.log("SearchInput", err);
			} finally {
				setIsLoading(false);
			}
		},
		500,
		[searchQuery],
	);

	return (
		<>
			{focused && (
				<div className="fixed top-0 left-0 bottom-0 right-0 bg-black/50 z-30 transition-all duration-1500" />
			)}
			<div ref={ref} className={cn("flex rounded-2xl flex-1 justify-between relative h-11", focused && "z-30")}>
				{/* <Search className="absolute top-1/2 translate-y-[-50%] left-3 h-5 text-gray-400" /> */}
				{isLoading ? (
					<Loader2 className="absolute top-1/2 translate-y-[-50%] left-3 h-5 text-gray-400 animate-spin" />
				) : (
					<Search className="absolute top-1/2 translate-y-[-50%] left-3 h-5 text-gray-400" />
				)}
				<input
					className="rounded-2xl outline-none w-full bg-gray-50 pl-11"
					type="text"
					placeholder="Найти пиццу..."
					onFocus={() => setFocused(true)}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>

				{products.length > 0 && (
					<div
						className={cn(
							"absolute w-full bg-white rounded-xl py-2 top-14 shadow-md transition-all duration-200 invisible opacity-0 z-30 ",
							focused && "visible opacity-100 top-12",
						)}
					>
						{products.map((product) => (
							<Link
								onClick={onClickItem}
								href={`/product/${product.id}`}
								key={product.id}
								className="flex items-center  w-full hover:bg-primary/10 cursor-pointer rounded-sm pl-5"
							>
								<img src={product.imageUrl} alt={product.name} className="rounded-sm h-8 w-8" />
								<div className="px-3 py-2 ">{product.name}</div>
							</Link>
						))}
					</div>
				)}
			</div>
		</>
	);
};
