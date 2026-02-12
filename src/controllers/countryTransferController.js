import { request as apiRequest } from "../plugins/http/baseAPI.js";
import {
    API_COUNTRY_TRANSFER_SET,
    API_COUNTRY_TRANSFER_GET,
    API_COUNTRY_TRANSFER_LIST,
    API_COUNTRY_TRANSFER_LIST_T,
    API_COUNTRY_TRANSFER_DEL
} from "../constants/api.js";

/**
 * Fetch Country Transfer List (All/Total)
 */
export async function fetchCountryTransferListAll() {
    const res = await apiRequest({
        url: API_COUNTRY_TRANSFER_LIST_T,
        method: "POST",
        data: {}
    });

    if (!res.ok) return res;

    const data = res.data || {};
    if (data.code !== undefined && data.code != 1) {
        return { ok: false, error: { code: data.code, message: data.msg || "Error fetching list" } };
    }

    return { ok: true, data: data.data || {} };
}

/**
 * Fetch Country Transfer List
 * @param {number} page
 * @param {number} per_page
 */
export async function fetchCountryTransferList(page = 1, per_page = 20) {
    const res = await apiRequest({
        url: API_COUNTRY_TRANSFER_LIST,
        method: "POST",
        data: { page, per_page }
    });

    if (!res.ok) return res;

    const data = res.data || {};
    if (data.code !== undefined && data.code != 1) {
        return { ok: false, error: { code: data.code, message: data.msg || "Error fetching list" } };
    }

    return { ok: true, data: data.data || {} };
}

/**
 * Get Single Country Transfer Details
 * @param {number} id
 */
export async function fetchCountryTransfer(id) {
    const res = await apiRequest({
        url: API_COUNTRY_TRANSFER_GET,
        method: "POST",
        data: { id }
    });

    if (!res.ok) return res;

    const data = res.data || {};
    if (data.code !== undefined && data.code != 1) {
        return { ok: false, error: { code: data.code, message: data.msg || "Error fetching details" } };
    }

    return { ok: true, data: data.data };
}

/**
 * Create or Update Country Transfer
 * @param {Object} data - { id, country_code, time_country }
 */
export async function createOrUpdateCountryTransfer(data) {
    const res = await apiRequest({
        url: API_COUNTRY_TRANSFER_SET,
        method: "POST",
        data
    });

    if (!res.ok) return res;

    const resData = res.data || {};
    if (resData.code !== undefined && resData.code != 1) {
        return { ok: false, error: { code: resData.code, message: resData.msg || "Operation failed" } };
    }

    return { ok: true, data: resData.data };
}

/**
 * Delete Country Transfer
 * @param {number} id
 */
export async function deleteCountryTransfer(id) {
    const res = await apiRequest({
        url: API_COUNTRY_TRANSFER_DEL,
        method: "POST",
        data: { id }
    });

    if (!res.ok) return res;

    const data = res.data || {};
    if (data.code !== undefined && data.code != 1) {
        return { ok: false, error: { code: data.code, message: data.msg || "Delete failed" } };
    }

    return { ok: true, data: data.data };
}
