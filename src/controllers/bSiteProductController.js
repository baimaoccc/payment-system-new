import { request as apiRequest } from "../plugins/http/baseAPI.js";
import {
	API_ACCOUNT_PRODUCT_LIST,
	API_ACCOUNT_PRODUCT_SET,
	API_ACCOUNT_PRODUCT_DELETE,
	API_ACCOUNT_PRODUCT_GET,
	API_ACCOUNT_TYPE_LIST_N,
	API_ACCOUNT_UPLOAD_EXCEL,
} from "../constants/api.js";

/**
 * Upload Product Excel
 * @param {Object} params - { filename, filetype, filedata }
 */
export async function uploadProductExcel(params) {
	const res = await apiRequest({
		url: API_ACCOUNT_UPLOAD_EXCEL,
		method: "POST",
		data: params,
	});

	if (!res.ok) return res;

	const data = res.data || {};
	// Compatible with code 0 and code 1 as success
	if (data.code !== undefined && data.code != 0 && data.code != 1) {
		return { ok: false, error: { code: data.code, message: data.msg || "Error uploading excel" } };
	}

	return { ok: true, data: data.data };
}

/**
 * Fetch Account Product Name List
 * @param {Object} params - { page, per_page, category_name }
 */
export async function fetchProductList({ page = 1, per_page = 20, category_name = null }) {
	const res = await apiRequest({
		url: API_ACCOUNT_PRODUCT_LIST,
		method: "POST",
		data: { page, per_page, category_name },
	});

	if (!res.ok) return res;

	const data = res.data || {};
	// Compatible with code 0 and code 1 as success
	if (data.code !== undefined && data.code != 0 && data.code != 1) {
		return { ok: false, error: { code: data.code, message: data.msg || "Error fetching product list" } };
	}

	const listData = data.data || {};
	const list = listData.list || [];
	const total = listData.total || 0;

	return { ok: true, data: { list, total } };
}

/**
 * Create or Update Account Product Name
 * @param {Object} params - { id, product_name, product_name_zh, account_type_id, lang }
 */
export async function createOrUpdateProduct(params) {
	const res = await apiRequest({
		url: API_ACCOUNT_PRODUCT_SET,
		method: "POST",
		data: params,
	});

	if (!res.ok) return res;

	const data = res.data || {};
	// Compatible with code 0 and code 1 as success
	if (data.code !== undefined && data.code != 0 && data.code != 1) {
		return { ok: false, error: { code: data.code, message: data.msg || "Error saving product" } };
	}

	return { ok: true, data: data.data };
}

/**
 * Delete Account Product Name
 * @param {Object} params - { id }
 */
export async function deleteProduct(id) {
	const res = await apiRequest({
		url: API_ACCOUNT_PRODUCT_DELETE,
		method: "POST",
		data: { id },
	});

	if (!res.ok) return res;

	const data = res.data || {};
	// Compatible with code 0 and code 1 as success
	if (data.code !== undefined && data.code != 0 && data.code != 1) {
		return { ok: false, error: { code: data.code, message: data.msg || "Error deleting product" } };
	}

	return { ok: true, data: data.data };
}

/**
 * Get Account Product Name Detail
 * @param {Object} params - { id }
 */
export async function getProduct(id) {
	const res = await apiRequest({
		url: API_ACCOUNT_PRODUCT_GET,
		method: "POST",
		data: { id },
	});

	if (!res.ok) return res;

	const data = res.data || {};
	// Compatible with code 0 and code 1 as success
	if (data.code !== undefined && data.code != 0 && data.code != 1) {
		return { ok: false, error: { code: data.code, message: data.msg || "Error getting product" } };
	}

	return { ok: true, data: data.data };
}

/**
 * Fetch Account Type List (All for Select)
 */
export async function fetchAccountTypesAll() {
	const res = await apiRequest({
		url: API_ACCOUNT_TYPE_LIST_N,
		method: "POST",
		data: {},
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
