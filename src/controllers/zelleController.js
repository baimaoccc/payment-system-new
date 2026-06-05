import { request as apiRequest } from "../plugins/http/baseAPI.js";
import { API_ZELLE_LIST, API_ZELLE_CREATE, API_ZELLE_DELETE } from "../constants/api.js";

/**
 * Fetch Zelle accounts list
 * @param {Object} params - { page, per_page }
 */
export async function fetchZelleAccounts(param) {
  const res = await apiRequest({ 
    url: API_ZELLE_LIST, 
    method: "POST", 
    data: param 
  });

  if (!res.ok) return res;
  
  const data = res.data || {};
  if (data.code !== undefined && data.code != 1) {
    return { ok: false, error: { code: data.code, message: data.msg || "Error fetching zelle accounts" } };
  }

  const list = data.data?.list || [];
  const total = data.data?.total || 0;

  return { ok: true, data: { list, total } };
}

/**
 * Create Zelle account
 * @param {Object} data - Account data
 */
export async function createZelleAccount(payload) {
  const res = await apiRequest({
    url: API_ZELLE_CREATE,
    method: "POST",
    data: payload
  });

  if (!res.ok) return res;

  const data = res.data || {};
  if (data.code !== undefined && data.code != 1) {
    return { ok: false, error: { code: data.code, message: data.msg || "Error creating zelle account" } };
  }

  return { ok: true, data: data.data };
}

/**
 * Update Zelle account
 * @param {Object} data - Account data including ID
 */
export async function updateZelleAccount(payload) {
    return createZelleAccount(payload);
}

/**
 * Delete Zelle account
 * @param {string|number} id - Account ID
 */
export async function deleteZelleAccount(id) {
    const res = await apiRequest({
        url: API_ZELLE_DELETE,
        method: "POST",
        data: { id }
    });

    if (!res.ok) return res;

    const data = res.data || {};
    if (data.code !== undefined && data.code != 1) {
        return { ok: false, error: { code: data.code, message: data.msg || "Error deleting zelle account" } };
    }

    return { ok: true, data: data.data };
}
