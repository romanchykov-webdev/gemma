"use client";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { UserRole } from "@prisma/client";
import { MenuIcon } from "lucide-react";
import React, { JSX, useState } from "react";
import { CategoriesDashboard } from "./categories-dashboard";
import { DoughTypesDashboard } from "./dough-types-dashboard";
import { IngredientsDashboard } from "./ingredients-dashboard";
import { Menu } from "./menu";
import { MenuList } from "./menu-list";
import { OrdersDashboard } from "./orders-dashboard";
import { ProductSizesDashboard } from "./product-sizes-dashboard";
import { ProductsDashboard } from "./products-dashboard";
import { StoriesDashboard } from "./stories-dashboard";
import { UsersDashboard } from "./users-dashboard";

interface Props {
	className?: string;
	userRole: UserRole;
}

export const DashboardClient: React.FC<Props> = ({ className, userRole }): JSX.Element => {
	const [isOpen, setIsOpen] = useState(false);
	const [activeSection, setActiveSection] = useState("");
	//
	const toggleMenu = (item: string) => {
		// console.log("DashBoardPage toggleMenu", item);
		setActiveSection(item);
		setIsOpen(false);
	};
	return (
		<div className={cn("", className)}>
			{/* menu component */}
			<Menu
				isOpen={isOpen}
				setIsOpen={setIsOpen}
				toggleMenu={toggleMenu}
				activeSection={activeSection || ""}
				userRole={userRole}
			/>
			{/* menu button */}
			<div className="flex items-center gap-1 flex-wrap ">
				<Button variant="outline" className="text-brand-primary" onClick={() => setIsOpen(!isOpen)}>
					<MenuIcon size={40} />
				</Button>
				<div className="overflow-auto scrollbar py-5 sm:block hidden">
					<MenuList
						className="flex-row"
						toggleMenu={toggleMenu}
						activeSection={activeSection}
						userRole={userRole}
					/>
				</div>
			</div>

			{/* admin owner can see all sections */}
			{userRole === UserRole.ADMIN ||
				(userRole === UserRole.OWNER && (
					<>
						{activeSection === "categories" && <CategoriesDashboard className="mt-5" />}
						{activeSection === "products" && <ProductsDashboard className="mt-5" />}
						{activeSection === "ingredients" && <IngredientsDashboard className="mt-5" />}
						{activeSection === "sizes" && <ProductSizesDashboard className="mt-5" />}
						{activeSection === "types" && <DoughTypesDashboard className="mt-5" />}
						{activeSection === "orders" && <OrdersDashboard className="mt-5" />}
						{activeSection === "users" && <UsersDashboard className="mt-5" />}
						{activeSection === "stories" && <StoriesDashboard className="mt-5" />}
					</>
				))}

			{/* content maker can see only Stories section */}
			{userRole === UserRole.CONTENT_MAKER && (
				<>{activeSection === "stories" && <StoriesDashboard className="mt-5" />}</>
			)}
		</div>
	);
};
