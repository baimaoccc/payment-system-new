import { request as apiRequest } from "../plugins/http/baseAPI.js";
import { API_STRIPE_LIST, API_STRIPE_LIST_ALL, API_STRIPE_CREATE, API_STRIPE_DELETE, API_STRIPE_LOG_LIST, API_STRIPE_WARNING_LIST, API_STRIPE_DISPUTE_LIST } from "../constants/api.js";

/**
 * Fetch Stripe accounts list
 * @param {Object} params - { page, per_page }
 */
export async function fetchStripeAccounts(param) {
  const res = await apiRequest({ 
    url: API_STRIPE_LIST, 
    method: "POST", 
    data: param 
  });

  if (!res.ok) return res;
  
  const data = res.data || {};
  if (data.code !== undefined && data.code != 1) {
    return { ok: false, error: { code: data.code, message: data.msg || "Error fetching stripe accounts" } };
  }

  // API returns { data: { list: [], total: 0 } }
  const list = data.data?.list || [];
  const total = data.data?.total || 0;

  return { ok: true, data: { list, total } };
}

/**
 * Fetch all Stripe accounts (non-paginated) for selectors
 * @param {Object} params - { user_id }
 */
export async function fetchStripeAccountListAll(params = {}) {
	const res = await apiRequest({
		url: API_STRIPE_LIST_ALL,
		method: "POST",
		data: params
	});

	if (!res.ok) return res;

	const data = res.data || {};
	// The provided example shows a "code" and "msg" but data is null (likely due to no login/perm in example).
	// Assuming successful response structure similar to others or direct array.
	// Based on other endpoints, data usually contains the payload.
	if (data.code !== undefined && data.code != 1 && data.code != 0) {
		return { ok: false, error: { code: data.code, message: data.msg || "Error fetching stripe accounts list" } };
	}

	return { ok: true, data: data.data?.list || [] };
}

/**
 * Create Stripe account
 * @param {Object} data - Account data
 */
export async function createStripeAccount(payload) {
  const res = await apiRequest({
    url: API_STRIPE_CREATE,
    method: "POST",
    data: payload
  });

  if (!res.ok) return res;

  const data = res.data || {};
  if (data.code !== undefined && data.code != 1) {
    return { ok: false, error: { code: data.code, message: data.msg || "Error creating stripe account" } };
  }

  return { ok: true, data: data.data };
}

/**
 * Update Stripe account (uses same endpoint as create usually, or we can add a new one if needed)
 * Assuming setStripe handles update if ID is present
 * @param {Object} data - Account data including ID
 */
export async function updateStripeAccount(payload) {
    return createStripeAccount(payload);
}

/**
 * Delete Stripe account
 * @param {string|number} id - Account ID
 */
export async function deleteStripeAccount(id) {
    const res = await apiRequest({
        url: API_STRIPE_DELETE,
        method: "POST",
        data: { id }
    });

    if (!res.ok) return res;

    const data = res.data || {};
    if (data.code !== undefined && data.code != 1) {
        return { ok: false, error: { code: data.code, message: data.msg || "Error deleting stripe account" } };
    }

    return { ok: true, data: data.data };
}

/**
 * Fetch Stripe logs list
 * @param {Object} params - { page, per_page, stripe_id }
 */
export async function fetchStripeLogs({ page = 1, per_page = 20, stripe_id }) {
    const res = await apiRequest({ 
        url: API_STRIPE_LOG_LIST, // Ensure this is imported
        method: "POST", 
        data: { page, per_page, stripe_id } 
    });

    if (!res.ok) return res;
    
    const data = res.data || {};
    if (data.code !== undefined && data.code != 1) {
        return { ok: false, error: { code: data.code, message: data.msg || "Error fetching stripe logs" } };
    }

    // API returns { data: { list: [], total: 0 } }
    const list = data.data?.list || [];
    const total = data.data?.total || 0;

    return { ok: true, data: { list, total } };
}

/**
 * Fetch Stripe Early Fraud Warnings
 * @param {Object} params - { id, limit, starting_after, ending_before }
 */
export async function fetchStripeWarnings({ id, limit = 20, starting_after, ending_before }) {
    const payload = { id, limit };
    if (starting_after) payload.starting_after = starting_after;
    if (ending_before) payload.ending_before = ending_before;

    const res = await apiRequest({
        url: API_STRIPE_WARNING_LIST,
        method: "POST",
        data: payload
    });

    if (!res.ok) return res;

    const data = res.data || {};
    // Note: User example showed code: 0, but existing system uses code: 1.
    // We check for error codes generally.
    if (data.code !== undefined && data.code != 0 && data.code != 1) {
        return { ok: false, error: { code: data.code, message: data.msg || "Error fetching warnings" } };
    }

    // Path: data.data.data.data (list)
    // data.data.data.has_more
    const stripeData = data.data?.data || {};
    const list = stripeData.data || [];
    const hasMore = stripeData.has_more || false;

    return { ok: true, data: { list, hasMore, lastId: list.length > 0 ? list[list.length - 1].id : null, firstId: list.length > 0 ? list[0].id : null } };
}

/**
 * Fetch Stripe Disputes
 * @param {Object} params - { id, limit, starting_after, ending_before }
 */
export async function fetchStripeDisputes({ id, limit = 20, starting_after, ending_before }) {
    const payload = { id, limit };
    if (starting_after) payload.starting_after = starting_after;
    if (ending_before) payload.ending_before = ending_before;

    const res = await apiRequest({
        url: API_STRIPE_DISPUTE_LIST,
        method: "POST",
        data: payload
    });

    if (!res.ok) return res;

    const data = res.data || {};
    if (data.code !== undefined && data.code != 0 && data.code != 1) {
        return { ok: false, error: { code: data.code, message: data.msg || "Error fetching disputes" } };
    }

    // Path: data.data.data.data (list)
    const stripeData = data.data?.data || {};
    const list = stripeData.data || [];
    const hasMore = stripeData.has_more || false;

    return { ok: true, data: { list, hasMore, lastId: list.length > 0 ? list[list.length - 1].id : null, firstId: list.length > 0 ? list[0].id : null } };
}
