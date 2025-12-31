import { request as apiRequest } from "../plugins/http/baseAPI.js";
import { API_ORDER_GRAPH_LIST, API_ORDER_DATA, API_ORDER_LIST } from "../constants/api.js";

/**
 * Fetch recent orders
 * @param {Object} params
 * @param {number} params.limit - Number of orders to fetch
 * @param {string} params.user_id - Optional user ID
 */
export async function fetchRecentOrders({ limit = 5, user_id }) {
	const payload = {
		page: 1,
		per_page: limit,
		user_id: user_id || null,
	};

	const res = await apiRequest({ url: API_ORDER_LIST, method: "POST", data: payload });
	return res;
}


/**
 * Fetch order graph data
 * @param {Object} params
 * @param {number|string} params.start_date - Timestamp (seconds)
 * @param {number|string} params.end_date - Timestamp (seconds)
 * @param {number} params.status - 1 for success, 2 for failed
 * @param {string} params.user_id - Optional user ID
 * @param {string} params.frequency - 'day' or 'month'
 */
export async function fetchOrderGraphData({ start_date, end_date, status, user_id, frequency = "month" }) {
	const payload = {
		start_date,
		end_date,
		status,
		user_id: user_id || null,
		frequency,
		type: "order_num"
	};

	const res = await apiRequest({ url: API_ORDER_GRAPH_LIST, method: "POST", data: payload });
	return res;
}

/**
 * Fetch order statistics data
 * @param {Object} params
 * @param {number|string} params.start_date - Timestamp (seconds)
 * @param {number|string} params.end_date - Timestamp (seconds)
 * @param {string} params.user_id - Optional user ID
 */
export async function fetchOrderData({ start_date, end_date, user_id }) {
	const payload = {
		start_date,
		end_date,
		user_id: user_id || null,
	};

	const res = await apiRequest({ url: API_ORDER_DATA, method: "POST", data: payload });
	return res;
}
