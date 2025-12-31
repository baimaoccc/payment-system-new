import { request as apiRequest, setTokenHeader, unsetTokenHeader } from "../plugins/http/baseAPI.js";
import { API_LOGIN, API_LOGOUT, API_USER_GET, API_TELMS } from "../constants/api.js";
import { idb } from "../plugins/indexeddb/index.js";
import { setLoading, setSession, clearSession } from "../store/slices/auth.js";

/**
 * 中文：获取验证码 / Get Captcha
 */
export async function getCaptcha({ dispatch, username }) {
	if (!username) {
		return { ok: false, error: { message: "pleaseEnterUsername" } };
	}

	const res = await apiRequest({ url: API_TELMS, method: "POST", data: { username } });

	if (!res.ok) {
		return { ok: false, error: { message: res.error?.message || "captchaFetchFailed" } };
	}

	const d = res.data || {};
	const code = d.code ?? (d.data && d.data.code) ?? d.data ?? "";

	if (!code) {
		return { ok: false, error: { message: "captchaFetchFailed" } };
	}

	return { ok: true, data: String(code) };
}

/**
 * 中文：登录控制器；参数 { username, password, remember }
 * English: Login controller; params { username, password, remember }
 */
export async function login({ dispatch, username, password, code, remember }) {
	if (!username || !password) return { ok: false, error: { message: "Missing credentials" } };
	dispatch(setLoading(true));
	// if (!code) {
	// 	dispatch(setLoading(false));
	// 	return { ok: false, error: { message: "missingCaptcha" } };
	// }
	const res = await apiRequest({ url: API_LOGIN, method: "POST", data: { username, password, code } });

	const payload = res.data || {};
	const rawCode = payload?.code ?? payload?.data?.code;
	const apiCode = typeof rawCode === "string" ? Number(rawCode) : rawCode;
	const success = apiCode === 1;
	if (!success) {
		const msg = payload?.msg || payload?.message;
		const err = msg
			? { code: apiCode ?? "API", message: msg }
			: { code: apiCode ?? "API", uiAPICode: "loginFailed" };
		dispatch(setLoading(false));
		return { ok: false, error: err };
	}
	const data = payload.data || {};
	const apiUser = data.user || { username };
	const token = data.token || payload.token || null;
	if (token) setTokenHeader(token);
	const user = apiUser;
	const role = "merchant";
	const merchantId = role === "admin" ? null : "m-001";
	dispatch(setSession({ user, role, merchantId, token }));
	if (remember) await idb.set("session", { user, role, merchantId, token });
	dispatch(setLoading(false));
	return { ok: true };
}

/** 中文/English：登出控制器 / logout controller */
export async function logout({ dispatch }) {
	const res = await apiRequest({ url: API_LOGOUT, method: "POST" });
	await idb.del("session");
	dispatch(clearSession());
	unsetTokenHeader();
	return res.ok ? { ok: true } : { ok: false, error: res.error };
}

/** 中文/English：恢复会话 / restore session */
export async function restoreSession({ dispatch }) {
	const s = await idb.get("session");
	if (s && s.token) {
		setTokenHeader(s.token);
		dispatch(setSession(s));

		// Fetch fresh user info
		try {
			const res = await apiRequest({ url: API_USER_GET, method: "POST" });
			const payload = res.data || {};
			const rawCode = payload?.code ?? payload?.data?.code;
			const apiCode = typeof rawCode === "string" ? Number(rawCode) : rawCode;

			if (apiCode === 1) {
				const apiUser = payload.data || {};
				// Merge existing user with fresh data
				const newSession = { ...s, user: { ...s.user, ...apiUser } };
				dispatch(setSession(newSession));
				await idb.set("session", newSession);
			} else if (apiCode === 401) {
				await logout({ dispatch });
			}
		} catch (e) {
			console.error("Failed to refresh user info:", e);
		}
	}
	return { ok: true };
}
