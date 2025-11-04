import { cn } from "@/lib/utils";
import React, { JSX } from "react";

interface Props {
	className?: string;
}

export const UsersDashboard: React.FC<Props> = ({ className }): JSX.Element => {
	return (
		<div className={cn("p-6 space-y-6", className)}>
			<div>
				<h2 className="text-2xl font-bold">users dashboard</h2>
			</div>
		</div>
	);
};
