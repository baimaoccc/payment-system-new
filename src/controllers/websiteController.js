import { request as apiRequest } from "../plugins/http/baseAPI.js";
import {
    API_WEBSITE_SET,
    API_WEBSITE_LIST,
    API_WEBSITE_GET,
    API_WEBSITE_DELETE,
} from "../constants/api.js";

/**
 * Fetch Website List
 * @param {Object} params - { page, per_page }
 */
export async function fetchWebsiteList({ page = 1, per_page = 20 }) {
    const res = await apiRequest({
        url: API_WEBSITE_LIST,
        method: "POST",
        data: { page, per_page },
    });

    if (!res.ok) return res;

    const data = res.data || {};
    // Compatible with code 0 and code 1 as success
    if (data.code !== undefined && data.code != 0 && data.code != 1) {
        return { ok: false, error: { code: data.code, message: data.msg || "Error fetching website list" } };
    }

    const listData = data.data || {};
    const list = listData.list || [];
    const total = listData.total || 0;

    return { ok: true, data: { list, total } };
}

/**
 * Create or Update Website
 * @param {Object} params - { user_id, domain_name, url, status, website_system, id }
 */
export async function createOrUpdateWebsite(params) {
    const res = await apiRequest({
        url: API_WEBSITE_SET,
        method: "POST",
        data: params,
    });

    if (!res.ok) return res;

    const data = res.data || {};
    // Compatible with code 0 and code 1 as success
    if (data.code !== undefined && data.code != 0 && data.code != 1) {
        return { ok: false, error: { code: data.code, message: data.msg || "Error saving website" } };
    }

    return { ok: true, data: data.data };
}

/**
 * Delete Website
 * @param {Object} params - { id }
 */
export async function deleteWebsite(id) {
    const res = await apiRequest({
        url: API_WEBSITE_DELETE,
        method: "POST",
        data: { id },
    });

    if (!res.ok) return res;

    const data = res.data || {};
    // Compatible with code 0 and code 1 as success
    if (data.code !== undefined && data.code != 0 && data.code != 1) {
        return { ok: false, error: { code: data.code, message: data.msg || "Error deleting website" } };
    }

    return { ok: true, data: data.data };
}

/**
 * Get Website Details
 * @param {Object} params - { id }
 */
export async function getWebsite(id) {
    const res = await apiRequest({
        url: API_WEBSITE_GET,
        method: "POST",
        data: { id },
    });

    if (!res.ok) return res;

    const data = res.data || {};
    // Compatible with code 0 and code 1 as success
    if (data.code !== undefined && data.code != 0 && data.code != 1) {
        return { ok: false, error: { code: data.code, message: data.msg || "Error getting website" } };
    }

    return { ok: true, data: data.data };
}
