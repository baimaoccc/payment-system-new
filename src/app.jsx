import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppRouter } from "./router/index.jsx";
import { GlobalToast } from "./components/ui/GlobalToast.jsx";
import { GlobalModal } from "./components/ui/GlobalModal.jsx";
import { restoreSession } from "./controllers/authController.js";
import { fetchEmailTemplatesForOrders } from "./controllers/ordersController.js";
import { setEmailTemplatesAll } from "./store/slices/ui.js";

import { store } from "./store/index.js";

/**
 * 中文：应用组件，负责渲染路由
 * English: App component, renders router
 */
export function App() {
	const dispatch = useDispatch();
	const [init, setInit] = useState(false);

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
