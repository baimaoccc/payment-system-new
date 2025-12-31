import { request as apiRequest } from "../plugins/http/baseAPI.js";
import { API_UPLOAD } from "../constants/api.js";

/**
 * Upload a file (e.g., image)
 * @param {File} file - The file object to upload
 * @returns {Promise<{ok: boolean, data?: {url: string}, error?: {message: string}}>}
 */
export async function uploadFile(file) {
	if (!file) return { ok: false, error: { message: "No file provided" } };

	const formData = new FormData();
	formData.append("file", file);

	// The apiRequest handles FormData automatically (sets Content-Type to multipart/form-data)
	const res = await apiRequest({
		url: API_UPLOAD,
		method: "POST",
		data: formData,
	});

	if (!res.ok) return res;

	// Assume response data structure. If it's just a string url or { url: "..." }
	// Adjust based on actual API response if known. 
	// Common pattern: { code: 1, data: { url: "..." }, msg: "..." } or similar
	// But apiRequest already unwraps res.data.
	
	// Let's assume the standard success response. 
	// If the API returns the URL directly in data or data.url
	
	return res;
}
