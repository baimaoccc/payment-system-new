import { request as apiRequest } from "../plugins/http/baseAPI.js";
import {
	API_ORDER_LIST,
	API_ORDER_GET,
	API_ORDER_CHARGES_LIST,
	API_ORDER_UPDATE_LOGISTICS,
	API_ORDER_RISK_LEVEL,
	API_EMAIL_TEMPLATE_LIST,
	API_EMAIL_TEMPLATE_LIST_N,
	API_EMAIL_SET_TASK,
}
	from "../constants/api.js";
import { setLoading, setError, setList, setTotal, setStats } from "../store/slices/orders.js";

/**
 * 中文：拉取订单列表；参数 { dispatch, page, pageSize, filters }
 * English: Fetch orders list; params { dispatch, page, pageSize, filters }
 */
export async function fetchOrders({ dispatch, page = 1, pageSize = 20, filters = {} }) {
	dispatch(setLoading(true));

	const payload = {
		page,
		per_page: pageSize,
		keywords: filters.query || null,
		status: filters.status === "all" ? null : filters.status,
		start_date: filters.range?.start ? new Date(filters.range.start).getTime() : null,
		end_date: filters.range?.end ? new Date(filters.range.end).getTime() : null,
		user_id: filters.userId || null,
		email: filters.email || null,
		orderNo: filters.orderNo || null,
		country: filters.country || null,
		firstName: filters.firstName || null,
		lastName: filters.lastName || null,
		shipping_status: filters.shippingStatus === "all" ? null : filters.shippingStatus,
		payment_status: filters.paymentStatus === "all" ? null : filters.paymentStatus,
		phone: filters.phone || null,
		comment: filters.comment || null,
		url: filters.url || null,
	};

	const res = await apiRequest({ url: API_ORDER_LIST, method: "POST", data: payload });

	if (!res.ok) {
		dispatch(setError(res.error));
		dispatch(setLoading(false));
		return res;
	}

	const data = res.data || {};

	// Handle business logic errors (e.g., 401 Unauthorized)
	if (data.code !== undefined && data.code != 1) {
		dispatch(setError({ message: data.msg || "Error fetching orders" }));
		dispatch(setLoading(false));
		return { ok: false, error: { code: data.code, message: data.msg } };
	}

	const rawData = data.data;
	let list = [];
	let total = 0;
	let stats = null;

	if (Array.isArray(rawData)) {
		list = rawData;
		total = rawData.length;
	} else if (rawData && typeof rawData === "object") {
		list = Array.isArray(rawData.list) ? rawData.list : Array.isArray(rawData.data) ? rawData.data : [];
		total = rawData.total || list.length;
		stats = rawData.tj || null;
	}

	dispatch(setList(list));
	dispatch(setTotal(total));
	dispatch(setStats(stats));
	dispatch(setLoading(false));
	return { ok: true };
}

/**
 * 中文：获取单个订单详情；参数 { dispatch, id }
 * English: Get single order details; params { dispatch, id }
 */
export async function fetchOrder({ dispatch, id }) {
	dispatch(setLoading(true));
	const res = await apiRequest({ url: API_ORDER_GET, method: "POST", data: { id } });

	if (!res.ok) {
		dispatch(setError(res.error));
		dispatch(setLoading(false));
		return res;
	}

	const data = res.data || {};
	if (data.code !== undefined && data.code != 1) {
		const error = { code: data.code, message: data.msg || "Error fetching order details" };
		dispatch(setError(error));
		dispatch(setLoading(false));
		return { ok: false, error };
	}

	dispatch(setLoading(false));
	return { ok: true, data: data.data };
}

/**
 * 中文：获取订单Charges列表；参数 { dispatch, id }
 * English: Fetch order charges list; params { dispatch, id }
 */
export async function fetchOrderCharges({ dispatch, id }) {
	// Don't set global loading here to avoid full page blocker if not desired, 
	// but user might want local loading state. 
	// We'll return the raw result for the component to handle state.
	
	const res = await apiRequest({ url: API_ORDER_CHARGES_LIST, method: "POST", data: { id } });

	if (!res.ok) {
		return res;
	}

	const data = res.data || {};
	// User example showed code 1 for success
	if (data.code !== undefined && data.code != 1) {
		return { ok: false, error: { code: data.code, message: data.msg || "Error fetching charges" } };
	}

	// Extract nested data safely
	// User example: data: [{ object: "list", data: [ ...charges ] }]
	// So we need res.data.data[0].data
	const chargesList = data.data?.[0]?.data || [];

	return { ok: true, data: chargesList };
}

export async function updateOrderLogistics({ id, logistics_mode, tracking_number, status = null }) {
	const payload = { id };
	if (logistics_mode !== undefined) payload.logistics_mode = logistics_mode;
	if (tracking_number !== undefined) payload.tracking_number = tracking_number;
	if (status !== null && status !== undefined) payload.status = status;
	return apiRequest({ url: API_ORDER_UPDATE_LOGISTICS, method: "POST", data: payload });
}

export async function fetchOrderRiskLevel({ id }) {
	const res = await apiRequest({ url: API_ORDER_RISK_LEVEL, method: "POST", data: { id } });
	if (!res.ok) return res;
	const data = res.data || {};
	if (data.code !== undefined && data.code != 1) {
		return { ok: false, error: { code: data.code, message: data.msg || "Error fetching risk level" } };
	}
	return { ok: true, data: data.data };
}

export async function fetchEmailTemplatesForOrders() {
	const res = await apiRequest({ url: API_EMAIL_TEMPLATE_LIST_N, method: "POST", data: {} });
	if (!res.ok) return res;
	const data = res.data || {};
	if (data.code !== undefined && data.code != 1) {
		return { ok: false, error: { code: data.code, message: data.msg || "Error fetching email templates" } };
	}
	const list = Array.isArray(data.data) ? data.data : Array.isArray(data.data?.list) ? data.data.list : [];
	return { ok: true, data: list };
}

export async function sendOrderEmailByTemplate({ template_id, orderNo }) {
	const payload = { template_id, orderNo };
	return apiRequest({ url: API_EMAIL_SET_TASK, method: "POST", data: payload });
}
