import { cn } from "@/lib/utils";
import React, { JSX } from "react";

interface Props {
	className?: string;
}

export const StoriesDashboard: React.FC<Props> = ({ className }): JSX.Element => {
	return <div className={cn("", className)}>Stories dashboard</div>;
};
