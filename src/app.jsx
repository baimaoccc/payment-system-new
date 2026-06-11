import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppRouter } from "./router/index.jsx";
import { GlobalToast } from "./components/ui/GlobalToast.jsx";
import { GlobalModal } from "./components/ui/GlobalModal.jsx";
import { restoreSession } from "./controllers/authController.js";
import { fetchEmailTemplatesForOrders } from "./controllers/ordersController.js";
import { setEmailTemplatesAll, setTheme } from "./store/slices/ui.js";
import { idb } from "./plugins/indexeddb/index.js";

import { store } from "./store/index.js";

/**
 * 中文：应用组件，负责渲染路由
 * English: App component, renders router
 */
export function App() {
	const dispatch = useDispatch();
	const [init, setInit] = useState(false);
	const theme = useSelector((s) => s.ui.theme);

	useEffect(() => {
		idb.get("theme").then((t) => {
			if (t === "dark" || t === "light") {
				dispatch(setTheme(t));
			}
		});
	}, [dispatch]);

	useEffect(() => {
		if (theme === "dark") {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	}, [theme]);

	useEffect(() => {
		restoreSession({ dispatch }).finally(() => {
			setInit(true);
			// Only fetch templates if authenticated
			const state = store.getState();
			if (state.auth.isAuthed) {
				fetchEmailTemplatesForOrders().then((res) => {
					if (res && res.ok) dispatch(setEmailTemplatesAll(res.data || []));
				});
			}
		});
	}, [dispatch]);

	if (!init) return null; // Or a loading spinner

	return (
		<>
			<GlobalToast />
			<GlobalModal />
			<AppRouter />
		</>
	);
}
