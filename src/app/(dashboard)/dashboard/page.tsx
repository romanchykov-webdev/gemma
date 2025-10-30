"use client";
import { Container, Title } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";
import { useState } from "react";
import { CategoriesAdminPanel, Menu, MenuList, ProductsAdminPanel } from "./components/shared";

export default function DashBoardPage() {
	//
	const [isOpen, setIsOpen] = useState(false);
	const [activeSection, setActiveSection] = useState("");
	//
	const toggleMenu = (item: string) => {
		console.log("DashBoardPage toggleMenu", item);
		setActiveSection(item);
	};
	//
	return (
		<Container className="mt-10">
			<Title text="Admin panel" size="lg" className="font-extrabold text-center" />

			{/* menu component */}
			<Menu isOpen={isOpen} setIsOpen={setIsOpen} toggleMenu={toggleMenu} />
			{/* menu button */}
			<div className="flex items-center gap-4 ">
				<Button variant="outline" className="text-brand-primary" onClick={() => setIsOpen(!isOpen)}>
					<MenuIcon size={40} />
				</Button>
				<div className="overflow-auto scrollbar py-5 sm:block hidden">
					<MenuList className="flex-row" toggleMenu={toggleMenu} />
				</div>
			</div>

			{/*  */}
			{/* Контент в зависимости от выбранной секции */}
			{activeSection === "categories" && <CategoriesAdminPanel className="mt-5" />}
			{activeSection === "products" && <ProductsAdminPanel className="mt-5" />}
		</Container>
	);
}
