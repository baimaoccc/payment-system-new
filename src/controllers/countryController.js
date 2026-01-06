import { request as apiRequest } from "../plugins/http/baseAPI.js";
import { API_COUNTRY_GROUP_LIST, API_COUNTRY_GROUP_LIST_N, API_COUNTRY_GROUP_GET, API_COUNTRY_GROUP_CREATE, API_COUNTRY_GROUP_DELETE, API_COUNTRY_LIST } from "../constants/api.js";

/**
 * Fetch Country List
 * @param {string} keywords - Optional search keyword
 */
export async function fetchCountryList(keywords = "") {
    const res = await apiRequest({
        url: API_COUNTRY_LIST,
        method: "POST",
        data: { keywords }
    });

    if (!res.ok) return res;

    const data = res.data || {};
    if (data.code !== undefined && data.code != 1) {
        return { ok: false, error: { code: data.code, message: data.msg || "Error fetching country list" } };
    }

    return { ok: true, data: data.data?.list || data.data || [] };
}

/**
 * Fetch Country Groups List
 * @param {Object} params - { page, per_page, name }
 */
export async function fetchCountryGroups({ page = 1, per_page = 20, name = null }) {
    const res = await apiRequest({
        url: API_COUNTRY_GROUP_LIST,
        method: "POST",
        data: { page, per_page, name }
    });

    if (!res.ok) return res;

    const data = res.data || {};
    if (data.code !== undefined && data.code != 1) {
        return { ok: false, error: { code: data.code, message: data.msg || "Error fetching country groups" } };
    }

    // Assuming API returns { data: { list: [], total: 0 } } based on other APIs
    // But user input just said "分页查询国家分组", didn't specify return structure.
    // Based on previous patterns in this project, it's usually data.data.list
    return { ok: true, data: data.data };
}

/**
 * Fetch Country Groups List N
 * @param {Object} params - { page, per_page, name }
 */
export async function fetchCountryGroupsN() {
    const res = await apiRequest({
        url: API_COUNTRY_GROUP_LIST_N,
        method: "POST",
        data: null
    });

    if (!res.ok) return res;

    const data = res.data || {};
    if (data.code !== undefined && data.code != 1) {
        return { ok: false, error: { code: data.code, message: data.msg || "Error fetching country groups" } };
    }

    // Assuming API returns { data: { list: [], total: 0 } } based on other APIs
    // But user input just said "分页查询国家分组", didn't specify return structure.
    // Based on previous patterns in this project, it's usually data.data.list
    return { ok: true, data: data.data };
}



/**
 * Fetch Country Group Details
 * @param {string|number} id
 */
export async function fetchCountryGroup(id) {
    const res = await apiRequest({
        url: API_COUNTRY_GROUP_GET,
        method: "POST",
        data: { id }
    });

    if (!res.ok) return res;

    const data = res.data || {};
    if (data.code !== undefined && data.code != 1) {
        return { ok: false, error: { code: data.code, message: data.msg || "Error fetching country group" } };
    }

    return { ok: true, data: data.data };
}

/**
 * Create Country Group
 * @param {Object} payload - { name, user_id, fz_json }
 */
export async function createCountryGroup(payload) {
    const res = await apiRequest({
        url: API_COUNTRY_GROUP_CREATE,
        method: "POST",
        data: payload
    });

    if (!res.ok) return res;

    const data = res.data || {};
    if (data.code !== undefined && data.code != 1) {
        return { ok: false, error: { code: data.code, message: data.msg || "Error creating country group" } };
    }

    return { ok: true, data: data.data };
}

/**
 * Delete Country Group
 * @param {string|number} id
 */
export async function deleteCountryGroup(id) {
    const res = await apiRequest({
        url: API_COUNTRY_GROUP_DELETE,
        method: "POST",
        data: { id }
    });

    if (!res.ok) return res;

    const data = res.data || {};
    if (data.code !== undefined && data.code != 1) {
        return { ok: false, error: { code: data.code, message: data.msg || "Error deleting country group" } };
    }

    return { ok: true, data: data.data };
}
