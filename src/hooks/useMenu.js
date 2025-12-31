import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { MENU_CONFIG, DEV_MENU_ITEM } from "../components/layout/menuConfig";
import { db } from "../utils/indexedDB.js";

export function useMenu() {
	const [searchParams] = useSearchParams();
	const [devMode, setDevMode] = useState(false);

	useEffect(() => {
		const checkDevMode = async () => {
			const isDev = searchParams.get("developer") === "1";
			if (isDev) {
				await db.set("developerMode", "1");
				setDevMode(true);
			} else {
				const stored = await db.get("developerMode");
				if (stored === "1") {
					setDevMode(true);
				}
			}
		};
		checkDevMode();
	}, [searchParams]);

	const menuItems = useMemo(() => {
		const menu = [...MENU_CONFIG];
		if (devMode) {
			menu.push(DEV_MENU_ITEM);
		}
		return menu;
	}, [devMode]);

	return menuItems;
}
