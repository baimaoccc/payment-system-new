import { request as apiRequest } from "../plugins/http/baseAPI.js";
import { API_ACCOUNT_TYPE_LIST, API_ACCOUNT_TYPE_SET, API_ACCOUNT_TYPE_DELETE, API_ACCOUNT_TYPE_GET } from "../constants/api.js";

/**
 * Fetch Account Type List
 * @param {Object} params - { page, per_page, category_name }
 */
export async function fetchAccountTypes({ page = 1, per_page = 20, category_name = null }) {
	const res = await apiRequest({
		url: API_ACCOUNT_TYPE_LIST,
		method: "POST",
		data: { page, per_page, category_name },
	});

	if (!res.ok) return res;

	const data = res.data || {};
	// Compatible with code 0 and code 1 as success
	if (data.code !== undefined && data.code != 0 && data.code != 1) {
		return { ok: false, error: { code: data.code, message: data.msg || "Error fetching account types" } };
	}

	const listData = data.data || {};
	const list = listData.list || [];
	const total = listData.total || 0;

	return { ok: true, data: { list, total } };
}

/**
 * Create or Update Account Type
 * @param {Object} params - { id, category_name, lang }
 */
export async function createOrUpdateAccountType(params) {
	const res = await apiRequest({
		url: API_ACCOUNT_TYPE_SET,
		method: "POST",
		data: params,
	});

	if (!res.ok) return res;

	const data = res.data || {};
	// Compatible with code 0 and code 1 as success
	if (data.code !== undefined && data.code != 0 && data.code != 1) {
		return { ok: false, error: { code: data.code, message: data.msg || "Error saving account type" } };
	}

	return { ok: true, data: data.data };
}

/**
 * Delete Account Type
 * @param {Object} params - { id }
 */
export async function deleteAccountType(id) {
	const res = await apiRequest({
		url: API_ACCOUNT_TYPE_DELETE,
		method: "POST",
		data: { id },
	});

	if (!res.ok) return res;

	const data = res.data || {};
	// Compatible with code 0 and code 1 as success
	if (data.code !== undefined && data.code != 0 && data.code != 1) {
		return { ok: false, error: { code: data.code, message: data.msg || "Error deleting account type" } };
	}

	return { ok: true, data: data.data };
}

/**
 * Get Account Type Detail
 * @param {Object} params - { id }
 */
export async function getAccountType(id) {
	const res = await apiRequest({
		url: API_ACCOUNT_TYPE_GET,
		method: "POST",
		data: { id },
	});

	if (!res.ok) return res;

	const data = res.data || {};
	// Compatible with code 0 and code 1 as success
	if (data.code !== undefined && data.code != 0 && data.code != 1) {
		return { ok: false, error: { code: data.code, message: data.msg || "Error getting account type" } };
	}

	return { ok: true, data: data.data };
}
