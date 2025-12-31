import { request as apiRequest } from "../plugins/http/baseAPI.js";
import { API_ROLE_LIST_MANAGE, API_ROLE_SET, API_ROLE_DEL, API_ROLE_GET } from "../constants/api.js";

export async function fetchRoles({ page = 1, per_page = 20 }) {
	const res = await apiRequest({ url: API_ROLE_LIST_MANAGE, method: "POST", data: { page, per_page } });
	if (!res.ok) return res;
	const data = res.data || {};
	if (data.code !== undefined && data.code != 1) {
		return { ok: false, error: { message: data.msg || "Fetch failed" } };
	}
	// Normalize list response
	let list = [];
	let total = 0;
	const raw = data.data;
	if (Array.isArray(raw)) {
		list = raw;
		total = raw.length;
	} else if (raw && typeof raw === "object") {
		list = raw.list || raw.data || [];
		total = raw.total || list.length;
	}
	return { ok: true, data: { list, total } };
}

export async function createRole(role) {
	const res = await apiRequest({ url: API_ROLE_SET, method: "POST", data: role });
	if (!res.ok) return res;
	const data = res.data || {};
	if (data.code !== undefined && data.code != 1) {
		return { ok: false, error: { message: data.msg || "Operation failed" } };
	}
	return { ok: true, data: data.data };
}

export async function deleteRole({ id }) {
	const res = await apiRequest({ url: API_ROLE_DEL, method: "POST", data: { id } });
	if (!res.ok) return res;
	const data = res.data || {};
	if (data.code !== undefined && data.code != 1) {
		return { ok: false, error: { message: data.msg || "Delete failed" } };
	}
	return { ok: true };
}

export async function getRole({ id }) {
	const res = await apiRequest({ url: API_ROLE_GET, method: "POST", data: { id } });
	if (!res.ok) return res;
	const data = res.data || {};
	if (data.code !== undefined && data.code != 1) {
		return { ok: false, error: { message: data.msg || "Fetch failed" } };
	}
	return { ok: true, data: data.data };
}
