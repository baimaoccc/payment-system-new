import axios from "axios";
import { API_BASE_URL } from "../../constants/api.js";
import { store } from "../../store/index.js";
import { idb } from "../indexeddb/index.js";
import { clearSession } from "../../store/slices/auth.js";

export const api = axios.create({ baseURL: API_BASE_URL });

export function setTokenHeader(token) {
	api.defaults.headers.common.Token = token;
}

export function unsetTokenHeader() {
	delete api.defaults.headers.common.Token;
}

export async function request({ url, method = "GET", data, params, headers = {} }) {
	const state = store.getState();
	const lang = state.ui.lang || "en";
	const newData = { ...data, lang };

	try {
		const res = await api.request({ url, method, data: newData, params, headers });
		return { ok: true, data: res.data };
	} catch (err) {
		const msg = err.response?.data?.msg || err.response?.data?.message || err.message;
		const code = err.response?.status || "HTTP";

		if (code === 401) {
			store.dispatch(clearSession());
			unsetTokenHeader();
			idb.del("session").finally(() => {
				const pathname = window.location.pathname;
				// Do not redirect if we are already on login page or on the public website
				if (pathname !== "/login" && !pathname.startsWith("/website")) {
					window.location.href = "/login";
				}
			});
		}

		return { ok: false, error: { code, message: msg } };
	}
}
