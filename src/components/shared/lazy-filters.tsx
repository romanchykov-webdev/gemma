"use client";

import React, { useSyncExternalStore } from "react";
import { Filters } from "./filters";

const subscribe = (callback: () => void) => {
	window.addEventListener("resize", callback);
	return () => window.removeEventListener("resize", callback);
};

const getSnapshot = () => window.innerWidth >= 1024;
const getServerSnapshot = () => false;

interface LazyFiltersProps {
	enabled?: boolean; // Оставить для FilterDrawer
}

export const LazyFilters: React.FC<LazyFiltersProps> = ({ enabled }) => {
	// console.log("LazyFilters enabled", enabled);
	const isDesktop = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

	if (!isDesktop && !enabled) return null;
	return <Filters enabled={enabled} />;
};
