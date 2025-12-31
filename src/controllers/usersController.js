import { request as apiRequest } from "../plugins/http/baseAPI.js";
import { API_USER_LIST, API_USER_LIST_N, API_USER_LIST_NII, API_USER_CREATE, API_USER_DELETE, API_USER_GET, API_ROLE_LIST } from "../constants/api.js";
import { setLoading, setError, setList, setTotal } from "../store/slices/users.js";

export async function fetchRoles() {
	const res = await apiRequest({ url: API_ROLE_LIST, method: "POST" });

	if (!res.ok) return res;

	const data = res.data || {};
	if (data.code !== undefined && data.code != 1) {
		return { ok: false, error: { code: data.code, message: data.msg || "Error fetching roles" } };
	}

	return { ok: true, data: data.data || [] };
}

export async function fetchUserListN() {
	const res = await apiRequest({ url: API_USER_LIST_N, method: "POST" });

	if (!res.ok) return res;
	
	const data = res.data || {};
	if (data.code !== undefined && data.code != 1) {
		return { ok: false, error: { code: data.code, message: data.msg || "Error fetching user list" } };
	}

	return { ok: true, data: data.data.list || [] };
}

export async function fetchUserListNII() {
	const res = await apiRequest({ url: API_USER_LIST_NII, method: "POST" });

	if (!res.ok) return res;

	const data = res.data || {};
	if (data.code !== undefined && data.code != 1 && data.code != 0) {
		return { ok: false, error: { code: data.code, message: data.msg || "Error fetching admin user list" } };
	}

	const list = Array.isArray(data.data) ? data.data : data.data?.list || [];
	return { ok: true, data: list };
}

export async function fetchUsers({ dispatch, page = 1, per_page = 20 }) {
	dispatch(setLoading(true));
	const res = await apiRequest({ url: API_USER_LIST, method: "POST", data: { page, per_page } });

	if (!res.ok) {
		dispatch(setError(res.error));
		dispatch(setLoading(false));
		return res;
	}

	const data = res.data || {};

	// Handle business logic errors
	if (data.code !== undefined && data.code != 1) {
		dispatch(setError({ message: data.msg || "Error fetching users" }));
		dispatch(setLoading(false));
		return { ok: false, error: { code: data.code, message: data.msg } };
	}

	const rawData = data.data;
	let list = [];
	let total = 0;

	if (Array.isArray(rawData)) {
		list = rawData;
		total = rawData.length;
	} else if (rawData && typeof rawData === "object") {
		list = Array.isArray(rawData.list) ? rawData.list : Array.isArray(rawData.data) ? rawData.data : [];
		total = rawData.total || list.length;
	}

	dispatch(setList(list));
	dispatch(setTotal(total));
	dispatch(setLoading(false));
	return { ok: true };
}

export async function createUser({ dispatch, user }) {
	// If user has id, it might be an update, but the API is setYonghu for both?
	// User provided setYonghu for "新增和修改". Usually update needs ID.
	// We will pass the user object as is.
	const res = await apiRequest({ url: API_USER_CREATE, method: "POST", data: user });

	if (!res.ok) return res;

	const data = res.data || {};
	if (data.code !== undefined && data.code != 1) {
		return { ok: false, error: { code: data.code, message: data.msg } };
	}

	return { ok: true, data: data.data };
}

export async function getUser({ dispatch, id }) {
	const res = await apiRequest({ url: API_USER_GET, method: "POST", data: { id } });

	if (!res.ok) return res;

	const data = res.data || {};
	7;
	if (data.code !== undefined && data.code != 1) {
		return { ok: false, error: { code: data.code, message: data.msg } };
	}

	return { ok: true, data: data.data };
}

export async function deleteUser({ dispatch, id }) {
	const res = await apiRequest({ url: API_USER_DELETE, method: "POST", data: { id } });

	if (!res.ok) return res;

	const data = res.data || {};
	if (data.code !== undefined && data.code != 1) {
		return { ok: false, error: { code: data.code, message: data.msg } };
	}

	return { ok: true };
}
