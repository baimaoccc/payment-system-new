import { request as apiRequest } from "../plugins/http/baseAPI";
import { API_SMTP_SET, API_SMTP_LIST, API_SMTP_GET, API_SMTP_DELETE } from "../constants/api";

export async function fetchSmtpList(params) {
	return apiRequest({ url: API_SMTP_LIST, method: "POST", data: params });
}

export async function createOrUpdateSmtp(data) {
	return apiRequest({ url: API_SMTP_SET, method: "POST", data });
}

export async function fetchSmtpDetail(id) {
	return apiRequest({ url: API_SMTP_GET, method: "POST", data: { id } });
}

export async function deleteSmtp(id) {
	return apiRequest({ url: API_SMTP_DELETE, method: "POST", data: { id } });
}

