import { request as apiRequest } from "../plugins/http/baseAPI.js";
import { API_LOG_LIST, API_LOG_GET } from "../constants/api.js";
import { setLoading, setList, setTotal } from "../store/slices/logs.js";

export async function fetchLogs({ dispatch, page = 1, per_page = 20, search = "" }) {
	dispatch(setLoading(true));
	const res = await apiRequest({
		url: API_LOG_LIST,
		method: "POST",
		data: {
			page,
			per_page,
			lang: "zh", // Default to zh as per requirement, or use i18n
			search,
		},
	});

	if (!res.ok) {
		dispatch(setLoading(false));
		return { ok: false, error: res.error };
	}

	const data = res.data || {};
	if (data.code !== undefined && data.code != 1) {
		dispatch(setLoading(false));
		return { ok: false, error: { code: data.code, message: data.msg || "Error fetching logs" } };
	}

	const listData = data.data || {};
	const list = listData.list || [];
	const total = listData.count || listData.total || 0; // Adapt based on actual response structure

	dispatch(setList(list));
	dispatch(setTotal(total));
	dispatch(setLoading(false));

	return { ok: true, data: list };
}

export async function getLogDetails(id) {
	const res = await apiRequest({
		url: API_LOG_GET,
		method: "POST",
		data: { id },
	});

	if (!res.ok) return res;

	const data = res.data || {};
	if (data.code !== undefined && data.code != 1) {
		return { ok: false, error: { code: data.code, message: data.msg || "Error fetching log details" } };
	}

	return { ok: true, data: data.data };
}
