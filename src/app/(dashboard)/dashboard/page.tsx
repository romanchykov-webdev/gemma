"use client";
import { Container, Title } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";
import { useState } from "react";
import { Menu, MenuList } from "./components/shared";

export default function DashBoardPage() {
	//
	const [isOpen, setIsOpen] = useState(false);

	const toggleMenu = () => {
		setIsOpen(!isOpen);
	};
	//
	return (
		<Container className="mt-10">
			<Title text="Admin panel" size="lg" className="font-extrabold text-center" />

			{/* menu component */}
			<Menu isOpen={isOpen} setIsOpen={setIsOpen} />
			{/* menu button */}
			<div className="flex items-center gap-4 ">
				<Button variant="outline" className="text-brand-primary" onClick={toggleMenu}>
					<MenuIcon size={40} />
				</Button>
				<div className="overflow-auto scrollbar py-5 sm:block hidden">
					<MenuList className="flex-row" />
				</div>
			</div>
		</Container>
	);
}
