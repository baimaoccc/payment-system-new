import { request as apiRequest } from "../plugins/http/baseAPI.js";
import { API_BLACKLIST_LIST, API_BLACKLIST_CREATE, API_BLACKLIST_GET, API_BLACKLIST_DELETE } from "../constants/api.js";
import { setList, setTotal, setLoading, setError } from "../store/slices/blacklist.js";

export async function fetchBlacklist({ dispatch, page = 1, pageSize = 20 }) {
	dispatch(setLoading(true));
	const res = await apiRequest({
		url: API_BLACKLIST_LIST,
		method: "POST",
		data: { page, per_page: pageSize },
	});

	if (!res.ok) {
		dispatch(setError(res.error));
		dispatch(setLoading(false));
		return res;
	}

	const data = res.data || {};

	if (data.code !== undefined && data.code != 1) {
		dispatch(setError({ message: data.msg || "Error fetching blacklist" }));
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

export async function createBlacklist({ dispatch, data }) {
	const res = await apiRequest({ url: API_BLACKLIST_CREATE, method: "POST", data });

	if (!res.ok) return res;

	const resData = res.data || {};
	if (resData.code !== undefined && resData.code != 1) {
		return { ok: false, error: { code: resData.code, message: resData.msg } };
	}

	return { ok: true, data: resData.data };
}

export async function deleteBlacklist({ dispatch, id }) {
	const res = await apiRequest({ url: API_BLACKLIST_DELETE, method: "POST", data: { id } });

	if (!res.ok) return res;

	const resData = res.data || {};
	if (resData.code !== undefined && resData.code != 1) {
		return { ok: false, error: { code: resData.code, message: resData.msg } };
	}

	return { ok: true };
}
