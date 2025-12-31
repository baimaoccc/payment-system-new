import { request as apiRequest } from "../plugins/http/baseAPI.js";
import { API_STRIPE_GROUP_CREATE, API_STRIPE_GROUP_LIST, API_STRIPE_GROUP_GET, API_STRIPE_GROUP_DELETE, API_STRIPE_GROUP_LIST_N } from "../constants/api.js";

/**
 * Fetch Stripe Group List
 * @param {Object} params - { page, per_page, name }
 */
export async function fetchStripeGroups({ page = 1, per_page = 20, name = null }) {
	const res = await apiRequest({
		url: API_STRIPE_GROUP_LIST,
		method: "POST",
		data: { page, per_page, name },
	});

	if (!res.ok) return res;

	const data = res.data || {};
	if (data.code !== undefined && data.code != 0 && data.code != 1) {
		return { ok: false, error: { code: data.code, message: data.msg || "Error fetching stripe groups" } };
	}

	const listData = data.data || {};
	const list = listData.list || [];
	const total = listData.total || 0;

	return { ok: true, data: { list, total } };
}

/**
 * Fetch Stripe Group List (No Pagination)
 * @param {Object} params - { user_id }
 */
export async function fetchPayGroupListN(params = {}) {
	const res = await apiRequest({
		url: API_STRIPE_GROUP_LIST_N,
		method: "POST",
		data: params,
	});

	if (!res.ok) return res;

	const data = res.data || {};
	if (data.code !== undefined && data.code != 0 && data.code != 1) {
		return { ok: false, error: { code: data.code, message: data.msg || "Error fetching stripe groups list" } };
	}

	// Assuming data.data is the list or data.data.list
	const list = Array.isArray(data.data) ? data.data : data.data?.list || [];

	return { ok: true, data: list };
}

/**
 * Create or Update Stripe Group
 * @param {Object} payload - { id, name, remark, stripe_list, user_id, lang }
 */
export async function createOrUpdateStripeGroup(payload) {
	const res = await apiRequest({
		url: API_STRIPE_GROUP_CREATE,
		method: "POST",
		data: payload,
	});

	if (!res.ok) return res;

	const data = res.data || {};
	if (data.code !== undefined && data.code != 0 && data.code != 1) {
		return { ok: false, error: { code: data.code, message: data.msg || "Error saving stripe group" } };
	}

	return { ok: true, data: data.data };
}

/**
 * Get Stripe Group Detail
 * @param {Object} params - { id, lang }
 */
export async function getStripeGroup({ id, lang = "zh" }) {
	const res = await apiRequest({
		url: API_STRIPE_GROUP_GET,
		method: "POST",
		data: { id, lang },
	});

	if (!res.ok) return res;

	const data = res.data || {};
	if (data.code !== undefined && data.code != 0 && data.code != 1) {
		return { ok: false, error: { code: data.code, message: data.msg || "Error getting stripe group" } };
	}

	return { ok: true, data: data.data };
}

/**
 * Delete Stripe Group
 * @param {Object} params - { id, lang }
 */
export async function deleteStripeGroup({ id, lang = "zh" }) {
	const res = await apiRequest({
		url: API_STRIPE_GROUP_DELETE,
		method: "POST",
		data: { id, lang },
	});

	if (!res.ok) return res;

	const data = res.data || {};
	if (data.code !== undefined && data.code != 0 && data.code != 1) {
		return { ok: false, error: { code: data.code, message: data.msg || "Error deleting stripe group" } };
	}

	return { ok: true, data: data.data };
}
