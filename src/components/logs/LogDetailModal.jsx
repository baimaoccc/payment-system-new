import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getLogDetails } from "../../controllers/logController.js";
import { addToast } from "../../store/slices/ui.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListAlt, faTimes, faSpinner, faCopy } from "@fortawesome/free-solid-svg-icons";

export function LogDetailModal({ open, logId, onClose, t }) {
	const dispatch = useDispatch();
	const [details, setDetails] = useState(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (open && logId) {
			setLoading(true);
			getLogDetails(logId).then((res) => {
				setLoading(false);
				if (res.ok) {
					setDetails(res.data);
				} else {
					// Handle error or just show empty
					setDetails(null);
				}
			});
		} else {
			setDetails(null);
		}
	}, [open, logId]);

	const renderInformation = (info) => {
		if (!info) return "-";

		const htmlDecode = (input) => {
			try {
				let doc = new DOMParser().parseFromString(input, "text/html");
				let text = doc.documentElement.textContent;
				// Try one more time if it still looks encoded (handling double encoding)
				if (text && (text.includes("&quot;") || text.includes("&amp;") || text.includes("&lt;"))) {
					doc = new DOMParser().parseFromString(text, "text/html");
					text = doc.documentElement.textContent;
				}
				return text;
			} catch (e) {
				return input;
			}
		};

		const deepProcess = (data) => {
			if (typeof data === "string") {
				// Helper to attempt JSON parsing with recursion
				const tryParse = (str) => {
					try {
						const parsed = JSON.parse(str);
						// If parsed is an object/array, recursively process it
						if (typeof parsed === "object" && parsed !== null) {
							return deepProcess(parsed);
						}
						// If parsed is a string and different from input (unwrapped), recurse
						if (typeof parsed === "string" && parsed !== str) {
							return deepProcess(parsed);
						}
						return parsed;
					} catch (e) {
						return undefined;
					}
				};

				// 1. First pass: Try raw parse
				// This is crucial for JSONs that contain HTML entities inside values (e.g. {"key": "{&quot;...}"})
				// Decoding them first would break the JSON structure.
				let result = tryParse(data);
				if (result !== undefined) return result;

				// 2. Second pass: Try cleaning slashes and parse
				// Handle cases where \/ is used (common in PHP/Backend)
				if (data.includes("\\/")) {
					result = tryParse(data.replace(/\\\//g, "/"));
					if (result !== undefined) return result;
				}

				// 3. Third pass: Iterative HTML/URL Decode and Parse
				// If raw parse failed, the string itself might be encoded.
				let current = data;
				let loop = 0;
				// Limit loops to prevent infinite cycles, but enough to handle double encoding
				while (loop < 5) {
					let next = htmlDecode(current);
					
					// Also try URL decode if HTML decode didn't change anything or as an additional step
					try {
						const urlDecoded = decodeURIComponent(next);
						if (urlDecoded !== next) {
							next = urlDecoded;
						}
					} catch (e) {}

					if (next === current) break;

					// Try parsing the decoded string
					result = tryParse(next);
					if (result !== undefined) return result;

					// Try parsing with cleaned slashes
					if (next.includes("\\/")) {
						result = tryParse(next.replace(/\\\//g, "/"));
						if (result !== undefined) return result;
					}

					current = next;
					loop++;
				}

				// 4. Final attempt with just slash cleaning on the most decoded string
				if (current.includes("\\/")) {
					const cleanSlashes = current.replace(/\\\//g, "/");
					result = tryParse(cleanSlashes);
					if (result !== undefined) return result;
					return cleanSlashes; // Return cleaned string if parse fails
				}

				return current;
			} else if (Array.isArray(data)) {
				return data.map((item) => deepProcess(item));
			} else if (typeof data === "object" && data !== null) {
				const result = {};
				Object.keys(data).forEach((key) => {
					result[key] = deepProcess(data[key]);
				});
				return result;
			}
			return data;
		};

		const processed = deepProcess(info);
		const isJson = typeof processed === "object" && processed !== null;

		if (isJson) {
			return <pre className="text-xs font-mono text-gray-700 bg-gray-50 p-3 rounded border border-gray-100 whitespace-pre-wrap break-all">{JSON.stringify(processed, null, 2)}</pre>;
		}

		return <div className="text-sm font-medium text-gray-700 break-all whitespace-pre-wrap bg-gray-50 p-2 rounded border border-gray-100 font-mono text-xs">{processed}</div>;
	};

	const handleCopy = (text) => {
		if (!text) return;
		navigator.clipboard
			.writeText(text)
			.then(() => {
				dispatch(addToast({ id: Date.now(), type: "success", message: t("copied") || "Copied" }));
			})
			.catch(() => {
				dispatch(addToast({ id: Date.now(), type: "error", message: t("copyFailed") || "Copy Failed" }));
			});
	};

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
			<div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
				<div className="flex items-center justify-between p-6 border-b border-gray-100">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
							<FontAwesomeIcon icon={faListAlt} />
						</div>
						<div>
							<h2 className="text-xl font-bold text-gray-900">{t("logDetails")}</h2>
							<p className="text-sm text-gray-500 mt-1">ID: {logId}</p>
						</div>
					</div>
					<button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100">
						<FontAwesomeIcon icon={faTimes} />
					</button>
				</div>

				<div className="p-6 overflow-y-auto custom-scrollbar flex-1">
					{loading ? (
						<div className="flex items-center justify-center py-12 text-gray-400">
							<FontAwesomeIcon icon={faSpinner} spin className="mr-2 text-2xl" />
							<span>{t("loading")}...</span>
						</div>
					) : details ? (
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-xs text-gray-500 block mb-1">{t("log_id")}</label>
									<div className="text-sm font-medium text-gray-900">{details.id}</div>
								</div>
								<div>
									<label className="text-xs text-gray-500 block mb-1">{t("username")}</label>
									<div className="text-sm font-medium text-gray-900">
										{details.username} <span className="text-gray-400 text-xs">({details.user_id})</span>
									</div>
								</div>
								<div className="col-span-2">
									<label className="text-xs text-gray-500 block mb-1">{t("log_title")}</label>
									<div className="text-sm font-medium text-gray-900 break-all">{details.title}</div>
								</div>
								<div className="col-span-2">
									<label className="text-xs text-gray-500 block mb-1">{t("log_link")}</label>
									<div className="text-sm font-medium text-blue-600 break-all">{details.link}</div>
								</div>
								<div>
									<label className="text-xs text-gray-500 block mb-1">{t("log_ip")}</label>
									<div className="text-sm font-medium text-gray-900">{details.ip}</div>
								</div>
								<div>
									<label className="text-xs text-gray-500 block mb-1">{t("log_createtime")}</label>
									<div className="text-sm font-medium text-gray-900">{details.createtime}</div>
								</div>
								<div className="col-span-2">
									<label className="text-xs text-gray-500 block mb-1">{t("log_user_agent")}</label>
									<div className="text-sm font-medium text-gray-700 break-all bg-gray-50 p-2 rounded border border-gray-100 font-mono text-xs">{details.user_agent}</div>
								</div>
								<div className="col-span-2">
									<div className="flex justify-between items-center mb-1">
										<label className="text-xs text-gray-500 block">{t("log_information")}</label>
										<button onClick={() => handleCopy(details.information)} className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1 cursor-pointer transition-colors p-1 rounded hover:bg-blue-50" title={t("copyOriginal") || "Copy Original"}>
											<FontAwesomeIcon icon={faCopy} />
											<span className="font-medium">{t("copy") || "Copy"}</span>
										</button>
									</div>
									{renderInformation(details.information)}
								</div>
							</div>
						</div>
					) : (
						<div className="text-center py-12 text-gray-400">{t("noData")}</div>
					)}
				</div>

				<div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
					<button onClick={onClose} className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all shadow-sm">
						{t("close")}
					</button>
				</div>
			</div>
		</div>
	);
}
