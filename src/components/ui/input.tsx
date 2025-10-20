"use client";
import { cn } from "@/lib/utils";
import * as React from "react";

function Input({
	className,
	type,
	showPassword,
	...props
}: React.ComponentProps<"input"> & { showPassword?: boolean }) {
	return (
		<input
			type={showPassword ? "text" : type}
			data-slot="input"
			className={cn(
				"file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground" +
					" dark:bg-input/30 border-input flex h-13 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs" +
					" transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent" +
					" file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
				"focus-visible:border-brand-border focus-visible:ring-brand-ring focus-visible:ring-[2px]",
				"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
				type === "password" ? "pl-10 " : "",
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
