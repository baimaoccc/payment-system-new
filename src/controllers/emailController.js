import { request as apiRequest } from "../plugins/http/baseAPI";
import {
	API_EMAIL_TYPE_LIST,
	API_EMAIL_TYPE_LIST_N,
	API_EMAIL_TYPE_CREATE,
	API_EMAIL_TYPE_GET,
	API_EMAIL_TYPE_DELETE,
	API_EMAIL_TEMPLATE_LIST,
	API_EMAIL_TEMPLATE_CREATE,
	API_EMAIL_TEMPLATE_GET,
	API_EMAIL_TEMPLATE_DELETE,
	API_EMAIL_SET_TASK,
	API_EMAIL_TASK_LIST,
	API_EMAIL_TASK_GET,
	API_EMAIL_TASK_DELETE,
} from "../constants/api";

/**
 * Fetch email types list
 * @param {Object} params - { page, per_page }
 */
export async function fetchEmailTypes(params) {
	return apiRequest({
		url: API_EMAIL_TYPE_LIST,
		method: "POST",
		data: params,
	});
}

/**
 * Fetch email types list (non-paginated)
 */
export async function fetchEmailTypesN() {
	return apiRequest({
		url: API_EMAIL_TYPE_LIST_N,
		method: "POST",
	});
}

/**
 * Create or update email type
 * @param {Object} data - { id, type_name, order_variable, logistics_variable, client_variable }
 */
export async function createEmailType(data) {
	return apiRequest({
		url: API_EMAIL_TYPE_CREATE,
		method: "POST",
		data,
	});
}

/**
 * Get email type details
 * @param {number|string} id
 */
export async function fetchEmailType(id) {
	return apiRequest({
		url: API_EMAIL_TYPE_GET,
		method: "POST",
		data: { id },
	});
}

/**
 * Delete email type
 * @param {number|string} id
 */
export async function deleteEmailType(id) {
	return apiRequest({
		url: API_EMAIL_TYPE_DELETE,
		method: "POST",
		data: { id },
	});
}

/**
 * Fetch email templates list
 * @param {Object} params - { page, per_page, name }
 */
export async function fetchEmailTemplates(params) {
	return apiRequest({
		url: API_EMAIL_TEMPLATE_LIST,
		method: "POST",
		data: params,
	});
}

/**
 * Create or update email template
 * @param {Object} data - { id, name, type_id, template, description }
 */
export async function createEmailTemplate(data) {
	return apiRequest({
		url: API_EMAIL_TEMPLATE_CREATE,
		method: "POST",
		data,
	});
}

/**
 * Get email template details
 * @param {number|string} id
 */
export async function fetchEmailTemplate(idOrParams) {
    const payload = typeof idOrParams === "object" && idOrParams !== null ? { ...idOrParams } : { id: idOrParams }
    payload._t = Date.now()
    return apiRequest({
        url: API_EMAIL_TEMPLATE_GET,
        method: "POST",
        data: payload,
    });
}

/**
 * Delete email template
 * @param {number|string} id
 */
export async function deleteEmailTemplate(id) {
	return apiRequest({
		url: API_EMAIL_TEMPLATE_DELETE,
		method: "POST",
		data: { id },
	});
}

export async function fetchEmailTasks(params) {
	return apiRequest({
		url: API_EMAIL_TASK_LIST,
		method: "POST",
		data: params,
	});
}

export async function createOrUpdateEmailTask(data) {
	return apiRequest({
		url: API_EMAIL_SET_TASK,
		method: "POST",
		data,
	});
}

export async function fetchEmailTask(idOrParams) {
	const payload = typeof idOrParams === "object" && idOrParams !== null ? { ...idOrParams } : { id: idOrParams };
	payload._t = Date.now();
	return apiRequest({
		url: API_EMAIL_TASK_GET,
		method: "POST",
		data: payload,
	});
}

export async function deleteEmailTask(id) {
	return apiRequest({
		url: API_EMAIL_TASK_DELETE,
		method: "POST",
		data: { id },
	});
}
