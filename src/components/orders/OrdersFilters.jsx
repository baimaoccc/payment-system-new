import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { setFilters, setPage, setUploading } from "../../store/slices/orders.js";
import { setAllUsers } from "../../store/slices/users.js";
import { addToast } from "../../store/slices/ui.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faFilter, faChevronUp, faTimes, faSpinner, faDownload, faUpload } from "@fortawesome/free-solid-svg-icons";
import Select, { components } from "react-select";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { fetchCountryList } from "../../controllers/countryController.js";
import { fetchUserListN } from "../../controllers/usersController.js";
import { getExportOrdersUrl, uploadOrderExcel } from "../../controllers/ordersController.js";
import { API_BASE_URL, API_ORDER_EXPORT_TEMPLATE } from "../../constants/api.js";
import { getOrderStatusOptions } from "../../utils/orderStatusRender.jsx";
import { getPaymentTypeOptions } from "../../utils/paymentUtils.js";
import { useResponsive } from "../../hooks/useResponsive.js";
import { db } from "../../utils/indexedDB.js";

const DropdownIndicator = (props) => (
	<components.DropdownIndicator {...props}>
		<FontAwesomeIcon icon={faChevronDown} className="text-gray-400 text-[10px]" />
	</components.DropdownIndicator>
);

const timestampToDateValue = (timestamp) => {
	if (!timestamp) return "";
	const date = new Date(Number(timestamp) * 1000);
	if (isNaN(date.getTime())) return "";
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

const dateValueToTimestamp = (dateString, isEnd = false) => {
	if (!dateString) return "";
	const [year, month, day] = dateString.split("-").map(Number);
	const date = new Date(year, month - 1, day);
	if (isEnd) {
		date.setHours(23, 59, 59, 999);
	} else {
		date.setHours(0, 0, 0, 0);
	}
	return Math.floor(date.getTime() / 1000);
};

const getChinaDate = () => {
	const now = new Date();
	const chinaTime = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + 8 * 3600 * 1000);
	const year = chinaTime.getFullYear();
	const month = String(chinaTime.getMonth() + 1).padStart(2, "0");
	const day = String(chinaTime.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

const InputField = ({ label, value, onChange, placeholder, type = "text" }) => (
	<div className="flex flex-col gap-1">
		<label className="text-[11px] font-medium text-gray-500">{label}</label>
		<input type={type} value={value} onChange={onChange} placeholder={placeholder} className="w-full h-8 px-3 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-colors" />
	</div>
);

const CalendarPicker = ({ label, value, onChange, t, lang, isEnd = false, minDate, maxDate }) => {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef(null);

	useEffect(() => {
		function handleClickOutside(event) {
			if (containerRef.current && !containerRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const date = value ? new Date(Number(value) * 1000) : null;
	const dateString = timestampToDateValue(value);

	return (
		<div className="flex flex-col gap-1 relative" ref={containerRef}>
			<label className="text-[11px] font-medium text-gray-500">{label}</label>
			<button onClick={() => setIsOpen(!isOpen)} className="w-full h-8 px-3 border border-gray-200 rounded-md text-xs text-left focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50 transition-colors flex items-center justify-between text-gray-700">
				{dateString || t("pleaseSelect") || "Select date"}
			</button>

			{isOpen && (
				<div className="absolute top-full left-0 z-[100] mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden p-2 min-w-[280px]">
					<Calendar
						onChange={(val) => {
							const ts = Math.floor(val.getTime() / 1000);
							const dateObj = new Date(ts * 1000);
							if (isEnd) {
								dateObj.setHours(23, 59, 59, 999);
							} else {
								dateObj.setHours(0, 0, 0, 0);
							}
							onChange(Math.floor(dateObj.getTime() / 1000));
							setIsOpen(false);
						}}
						value={date}
						minDate={minDate}
						maxDate={maxDate}
						className="border-none shadow-none text-xs w-full"
						locale={lang === "zh" ? "zh-CN" : "en-US"}
					/>
				</div>
			)}
		</div>
	);
};

export function OrdersFilters() {
	const dispatch = useDispatch();
	const { t, lang } = useI18n();
	const { isMobile } = useResponsive();
	const reduxFilters = useSelector((s) => s.orders.filters);
	const loading = useSelector((s) => s.orders.loading);
	const ordersStats = useSelector((s) => s.orders.stats);
	const allUsers = useSelector((s) => s.users.allUsers);
	const role = useSelector((s) => s.auth.role);
	const token = useSelector((s) => s.auth.token);
	const containerRef = useRef(null);
	const uploadInputRef = useRef(null);

	const [isExpanded, setIsExpanded] = useState(false);
	const [isExporting, setIsExporting] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [countryOptions, setCountryOptions] = useState([]);
	const [userOptions, setUserOptions] = useState([]);

	const [localFilters, setLocalFilters] = useState({
		query: reduxFilters.query || "",
		status: reduxFilters.status || "all",
		firstName: reduxFilters.firstName || "",
		lastName: reduxFilters.lastName || "",
		userId: reduxFilters.userId || "",
		orderNo: reduxFilters.orderNo || "",
		startTime: reduxFilters.range?.start || "",
		endTime: reduxFilters.range?.end || "",
		email: reduxFilters.email || "",
		country: reduxFilters.country || null,
		comment: reduxFilters.comment || "",
		shippingStatus: reduxFilters.shippingStatus || "all",
		url: reduxFilters.url || "",
		phone: reduxFilters.phone || "",
		paymentType: reduxFilters.paymentType !== undefined ? reduxFilters.paymentType : "",
	});

	// Load filters from IndexedDB on mount
	useEffect(() => {
		const loadFilters = async () => {
			// const cached = await db.get("orders_filters_cache");
			const cached = null; // Force default to China time today as per user request
			if (cached) {
				try {
					// cached is already an object if using db.set with an object,
					// but let's assume it might be stored as we passed it.
					// IndexedDB stores structural clones, so no need for JSON.parse usually
					// unless we explicitly stored a string.
					// Based on previous code, we might have been storing strings in localStorage.
					// If db.get returns the object directly:
					const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;

					// Type conversion for numeric fields that might be stored as strings
					if (parsed.status && parsed.status !== "all") {
						parsed.status = Number(parsed.status);
					}
					// status 0 handling
					if (parsed.status === "0" || parsed.status === 0) {
						parsed.status = 0;
					}

					if (parsed.userId) {
						parsed.userId = Number(parsed.userId);
					}
					if (parsed.paymentType !== undefined && parsed.paymentType !== "") {
						parsed.paymentType = Number(parsed.paymentType);
					}
					if (parsed.startTime) {
						parsed.startTime = Number(parsed.startTime);
					}
					if (parsed.endTime) {
						parsed.endTime = Number(parsed.endTime);
					}

					// Validate parsed data structure lightly if needed, or just merge
					setLocalFilters((prev) => ({ ...prev, ...parsed }));

					// Apply to Redux immediately so list fetches with these filters
					dispatch(
						setFilters({
							...parsed,
							range: parsed.startTime || parsed.endTime ? { start: parsed.startTime, end: parsed.endTime } : null,
						}),
					);
				} catch (e) {
					console.error("Failed to parse cached filters", e);
				}
			} else {
				// No cache, set default to China today
				const today = getChinaDate();
				const startTs = dateValueToTimestamp(today, false);
				const endTs = dateValueToTimestamp(today, true);

				const defaults = {
					startTime: startTs,
					endTime: endTs,
				};

				dispatch(
					setFilters({
						...reduxFilters,
						...defaults,
						range: { start: defaults.startTime, end: defaults.endTime },
					}),
				);

				console.log("设定值----");
				console.log({
					...reduxFilters,
					...defaults,
					// range: { start: defaults.startTime, end: defaults.endTime },
				});
			}
		};
		loadFilters();
	}, []); // Empty dependency array ensures this runs once on mount

	useEffect(() => {
		if (allUsers.length > 0) {
			const opts = allUsers.map((u) => ({ value: u.id, label: u.username }));
			setUserOptions(opts);
		} else {
			fetchUserListN().then((res) => {
				if (res.ok) {
					const list = Array.isArray(res.data) ? res.data : res.data?.list || [];
					dispatch(setAllUsers(list));
					// Local update will happen via allUsers dependency change or we can set it here too
					// But better to rely on useEffect dependency on allUsers
				}
			});
		}
	}, [allUsers]);

	useEffect(() => {
		fetchCountryList().then((res) => {
			if (res.ok && Array.isArray(res.data)) {
				const opts = res.data.map((c) => ({
					value: c.code || c.iso_code_2 || c.id,
					label: lang === "zh" ? c.name_cn || c.name : c.name_en || c.name, // Dynamic name based on lang
					alpha2: c.alpha2 || String(c.id), // Use alpha2 (e.g. US) if available, fallback to ID
					alpha3: c.alpha3 || String(c.id), // Use alpha3 (e.g. USA) if available, fallback to ID
				}));
				setCountryOptions(opts);
			}
		});

		// Close advanced filters when clicking outside
		function handleClickOutside(event) {
			if (containerRef.current && !containerRef.current.contains(event.target)) {
				setIsExpanded(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Sync local state if redux state changes externally
	useEffect(() => {
		setLocalFilters((prev) => ({
			...prev,
			...reduxFilters,
			startTime: reduxFilters.range?.start || prev.startTime || "",
			endTime: reduxFilters.range?.end || prev.endTime || "",
		}));
	}, [reduxFilters]);

	const handleSearch = () => {
		// Save to IndexedDB
		db.set("orders_filters_cache", localFilters);

		dispatch(
			setFilters({
				...localFilters,
				range: localFilters.startTime || localFilters.endTime ? { start: localFilters.startTime, end: localFilters.endTime } : null,
			}),
		);
		dispatch(setPage(1));
		setIsExpanded(false);
	};

	const handleReset = () => {
		// Clear IndexedDB
		db.del("orders_filters_cache");

		const resetState = {
			query: "",
			status: "all",
			firstName: "",
			lastName: "",
			userId: null,
			orderNo: "",
			startTime: "",
			endTime: "",
			email: "",
			country: null,
			comment: "",
			shippingStatus: "all",
			url: "",
			phone: "",
			paymentType: "",
		};
		setLocalFilters(resetState);
		dispatch(setFilters({ ...resetState, range: null }));
		dispatch(setPage(1));
		setIsExpanded(false);
	};

	const handleExport = () => {
		if (isExporting) return;
		setIsExporting(true);

		try {
			const url = getExportOrdersUrl({ filters: reduxFilters, token });
			console.log(url);
			window.open(url, "_blank");
		} catch (e) {
			console.error("Export error:", e);
			dispatch(addToast({ type: "error", message: t("exportFailed") }));
		} finally {
			setTimeout(() => setIsExporting(false), 1000);
		}
	};

	const handleDownloadLogisticsTemplate = () => {
		const url = `${API_BASE_URL}${API_ORDER_EXPORT_TEMPLATE}`;
		window.open(url, "_blank");
	};

	const handleUploadLogisticsTemplate = (e) => {
		const file = e.target.files && e.target.files[0];
		if (!file) return;
		if (isUploading) return;
		setIsUploading(true);
		dispatch(setUploading(true));

		const reader = new FileReader();
		reader.onload = async () => {
			try {
				const result = reader.result;
				if (typeof result !== "string") {
					throw new Error("Invalid file result");
				}
				const base64 = result.split(",")[1] || result;

				const res = await uploadOrderExcel({ filename: file.name, filetype: file.type, filedata: base64 });
				if (!res.ok) throw new Error(res.error?.message || "Upload failed");

				dispatch(addToast({ type: "success", message: t("logisticsShipment") || "批量发货已提交" }));
			} catch (error) {
				console.error("上传物流模版失败", error);
				dispatch(addToast({ type: "error", message: t("saveFailed") || "上传失败" }));
			} finally {
				setIsUploading(false);
				dispatch(setUploading(false));
				if (uploadInputRef.current) uploadInputRef.current.value = "";
			}
		};
		reader.readAsDataURL(file);
	};

	const statusOptions = getOrderStatusOptions(t);
	const paymentTypeOptions = getPaymentTypeOptions(t);

	const shippingStatusOptions = [
		{ value: "all", label: t("all") },
		{ value: "已发货", label: t("shipped") || "Shipped" },
		{ value: "未发货", label: t("notShipped") || "Not Shipped" },
	];

	// Prepare active filters list for display
	const activeFiltersList = [];
	if (reduxFilters.query) {
		activeFiltersList.push({ key: "query", label: t("keyword") || "Keyword", value: reduxFilters.query });
	}
	if (reduxFilters.status !== undefined && reduxFilters.status !== null && reduxFilters.status !== "" && reduxFilters.status !== "all") {
		const statusLabel = statusOptions.find((o) => String(o.value) === String(reduxFilters.status))?.label || reduxFilters.status;
		activeFiltersList.push({ key: "status", label: t("status"), value: statusLabel });
	}
	if (reduxFilters.firstName) {
		activeFiltersList.push({ key: "firstName", label: t("orderFirstName"), value: reduxFilters.firstName });
	}
	if (reduxFilters.lastName) {
		activeFiltersList.push({ key: "lastName", label: t("orderLastName"), value: reduxFilters.lastName });
	}
	if (reduxFilters.userId) {
		const userLabel = userOptions.find((u) => String(u.value) === String(reduxFilters.userId))?.label || reduxFilters.userId;
		activeFiltersList.push({ key: "userId", label: t("username"), value: userLabel });
	}
	if (reduxFilters.orderNo) {
		activeFiltersList.push({ key: "orderNo", label: t("orderNo"), value: reduxFilters.orderNo });
	}
	if (reduxFilters.email) {
		activeFiltersList.push({ key: "email", label: t("email"), value: reduxFilters.email });
	}
	if (reduxFilters.phone) {
		activeFiltersList.push({ key: "phone", label: t("phone"), value: reduxFilters.phone });
	}
	if (reduxFilters.url) {
		activeFiltersList.push({ key: "url", label: t("url"), value: reduxFilters.url });
	}
	if (reduxFilters.comment) {
		activeFiltersList.push({ key: "comment", label: t("paymentChannel"), value: reduxFilters.comment });
	}
	if (reduxFilters.country) {
		const countryLabel = countryOptions.find((c) => c.alpha2 === reduxFilters.country || String(c.value) === String(reduxFilters.country))?.label || reduxFilters.country;
		activeFiltersList.push({ key: "country", label: t("country"), value: countryLabel });
	}
	if (reduxFilters.shippingStatus && reduxFilters.shippingStatus !== "all") {
		const shippingLabel = shippingStatusOptions.find((o) => String(o.value) === String(reduxFilters.shippingStatus))?.label || reduxFilters.shippingStatus;
		activeFiltersList.push({ key: "shippingStatus", label: t("logisticsStatus"), value: shippingLabel });
	}
	if (reduxFilters.paymentType !== undefined && reduxFilters.paymentType !== null && reduxFilters.paymentType !== "") {
		const label = paymentTypeOptions.find((o) => String(o.value) === String(reduxFilters.paymentType))?.label || reduxFilters.paymentType;
		activeFiltersList.push({ key: "paymentType", label: t("paymentType"), value: label });
	}
	if (reduxFilters.range?.start) {
		activeFiltersList.push({ key: "startTime", label: t("startTime"), value: timestampToDateValue(reduxFilters.range.start) });
	}
	if (reduxFilters.range?.end) {
		activeFiltersList.push({ key: "endTime", label: t("endTime"), value: timestampToDateValue(reduxFilters.range.end) });
	}

	const removeFilter = (key) => {
		const newFilters = { ...reduxFilters };
		if (key === "startTime" || key === "endTime") {
			// Handle range specially
			const range = { ...newFilters.range };
			if (key === "startTime") delete range.start;
			if (key === "endTime") delete range.end;
			newFilters.range = Object.keys(range).length > 0 ? range : null;
		} else {
			// Reset to default values
			if (key === "status" || key === "shippingStatus") newFilters[key] = "all";
			else if (key === "userId" || key === "country" || key === "paymentType") newFilters[key] = "";
			else newFilters[key] = "";
		}

		// Update Redux
		dispatch(setFilters(newFilters));
		dispatch(setPage(1));

		// Update Local State to match
		setLocalFilters((prev) => ({
			...prev,
			[key]: key === "status" || key === "shippingStatus" ? "all" : "",
			startTime: key === "startTime" ? "" : prev.startTime,
			endTime: key === "endTime" ? "" : prev.endTime,
		}));

		// Update Cache
		db.set("orders_filters_cache", newFilters);
	};

	const selectStyles = {
		control: (base) => ({
			...base,
			minHeight: 32,
			height: 32,
			borderRadius: 6,
			backgroundColor: "#f9fafb",
			borderColor: "#e5e7eb",
			borderWidth: 1,
			boxShadow: "none",
			paddingLeft: 2,
			paddingRight: 2,
			fontSize: 12,
			"&:hover": { borderColor: "#d1d5db" },
		}),
		valueContainer: (base) => ({ ...base, padding: "0 4px" }),
		indicatorsContainer: (base) => ({ ...base, padding: 0 }),
		dropdownIndicator: (base) => ({ ...base, color: "#6b7280", padding: 4 }),
		indicatorSeparator: () => ({ display: "none" }),
		singleValue: (base) => ({ ...base, color: "#374151" }),
		option: (base, state) => ({
			...base,
			fontSize: 12,
			padding: "6px 10px",
			backgroundColor: state.isFocused ? "#eff6ff" : state.isSelected ? "#dbeafe" : "white",
			color: "#374151",
			cursor: "pointer",
		}),
		menu: (base) => ({ ...base, borderRadius: 6, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)", zIndex: 60 }),
	};

	// Stats data from API (ordersStats from Redux) or defaults
	const displayStats = {
		currencies: ordersStats?.groupbycurrency || [],
		totalUsd: ordersStats?.usdsum || "0.00",
		successCount: ordersStats?.successcount || 0,
		paymentRate: ordersStats?.countorder ? ((ordersStats.successcount / ordersStats.countorder) * 100).toFixed(1) + "%" : "0.0%",
	};

	return (
		<div className="relative bg-white rounded-xl shadow-sm border border-gray-100 mb-4 transition-all duration-300" ref={containerRef}>
			<input ref={uploadInputRef} type="file" accept=".xls,.xlsx" className="hidden" onChange={handleUploadLogisticsTemplate} />
			{/* Header / Stats & Toggle */}
			<div className="p-4 grid gap-4 xl:grid-cols-[2fr_1fr] xl:items-center">
				{/* Stats */}
				<div className={`flex flex-wrap gap-2 items-center flex-1 ${isMobile ? "justify-start" : ""}`}>
					{displayStats.currencies.map((curr, idx) => (
						<div key={idx} className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-bold shadow-sm flex items-center">
							{curr.amount}
							<span className="ml-1 text-[10px] opacity-80">{curr.currency}</span>
						</div>
					))}

					<div className="bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-bold shadow-sm flex items-center">
						<span className="opacity-90 mr-1">{t("totalAmount")}:</span>
						{displayStats.totalUsd}
						<span className="ml-0.5 text-[10px] opacity-80">USD</span>
					</div>

					<div className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-xs font-bold shadow-sm flex items-center">
						<span className="opacity-90 mr-1">{t("successCount")}:</span>
						{displayStats.successCount}
					</div>

					<div className="bg-emerald-500 text-white px-3 py-1.5 rounded-md text-xs font-bold shadow-sm flex items-center">
						<span className="opacity-90 mr-1">{t("paymentRate")}:</span>
						{displayStats.paymentRate}
					</div>
				</div>

				{/* Filter Toggle */}
				<div className="flex flex-wrap justify-end items-center gap-2 shrink-0">
					{activeFiltersList.map((filter) => (
						<div key={filter.key} className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-100 animate-fade-in">
							<span className="font-medium">{filter.label}:</span>
							<span className="max-w-[100px] truncate" title={filter.value}>
								{filter.value}
							</span>
							<button onClick={() => removeFilter(filter.key)} className="ml-1 text-blue-400 hover:text-blue-600 focus:outline-none transition-colors">
								<FontAwesomeIcon icon={faTimes} />
							</button>
						</div>
					))}
					{role !== "adv" && (
						<>
							<button onClick={handleDownloadLogisticsTemplate} disabled={loading} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-white text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
								<FontAwesomeIcon icon={faDownload} />
								{t("downloadLogisticsTemplate")}
							</button>
							<button
								onClick={() => {
									if (uploadInputRef.current) uploadInputRef.current.click();
								}}
								disabled={isUploading || loading}
								className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-white text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
								{isUploading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faUpload} />}
								{t("uploadLogisticsTemplate")}
							</button>
							<button onClick={handleExport} disabled={isExporting || loading} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-white text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
								{isExporting ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faDownload} />}
								{t("exportOrders")}
							</button>
						</>
					)}
					<button onClick={() => setIsExpanded(!isExpanded)} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border whitespace-nowrap ${isExpanded ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
						<FontAwesomeIcon icon={faFilter} />
						{t("moreFilters")}
						<FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} className="ml-1" />
					</button>
				</div>
			</div>

			{/* Collapsible Advanced Filters - Absolute Positioned */}
			{isExpanded && (
				<div className="absolute top-full left-0 right-0 z-50 px-4 pb-4 pt-4 bg-white shadow-xl border border-gray-100 rounded-xl -mt-[1px]">
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
						<div className="flex flex-col gap-1">
							<label className="text-[11px] font-medium text-gray-500">{t("username") || "Username"}</label>
							<Select className="hs-user-selector" options={userOptions} value={userOptions.find((o) => o.value === localFilters.userId) || null} onChange={(opt) => setLocalFilters({ ...localFilters, userId: opt?.value || "" })} styles={selectStyles} components={{ DropdownIndicator, IndicatorSeparator: () => null }} placeholder={t("selectUser") || "Select User"} isClearable />
						</div>
						<InputField label={t("orderNo")} value={localFilters.orderNo} onChange={(e) => setLocalFilters({ ...localFilters, orderNo: e.target.value })} placeholder={t("enterOrderNo") || "Enter order no"} />
						<InputField label={t("orderFirstName")} value={localFilters.firstName} onChange={(e) => setLocalFilters({ ...localFilters, firstName: e.target.value })} placeholder={t("enterOrderFirstName") || "Enter order first name"} />
						<InputField label={t("orderLastName")} value={localFilters.lastName} onChange={(e) => setLocalFilters({ ...localFilters, lastName: e.target.value })} placeholder={t("enterOrderLastName") || "Enter order last name"} />
						<InputField label={t("email")} value={localFilters.email} onChange={(e) => setLocalFilters({ ...localFilters, email: e.target.value })} placeholder={t("enterEmail") || "Enter email"} />
						<InputField label={t("phone")} value={localFilters.phone} onChange={(e) => setLocalFilters({ ...localFilters, phone: e.target.value })} placeholder={t("enterPhone") || "Enter phone"} />
						<InputField label={t("url")} value={localFilters.url} onChange={(e) => setLocalFilters({ ...localFilters, url: e.target.value })} placeholder={t("url") || "Enter URL"} />
						<InputField label={t("paymentChannel")} value={localFilters.comment} onChange={(e) => setLocalFilters({ ...localFilters, comment: e.target.value })} placeholder={t("enterPaymentChannel") || "Enter Payment Channel"} />

						<div className="flex flex-col gap-1">
							<label className="text-[11px] font-medium text-gray-500">{t("paymentType")}</label>
							<Select options={[{ value: "", label: t("all") }, ...paymentTypeOptions]} value={localFilters.paymentType === "" ? { value: "", label: t("all") } : paymentTypeOptions.find((o) => String(o.value) === String(localFilters.paymentType)) || { value: "", label: t("all") }} onChange={(opt) => setLocalFilters({ ...localFilters, paymentType: opt?.value ?? "" })} styles={selectStyles} components={{ DropdownIndicator, IndicatorSeparator: () => null }} placeholder={t("pleaseSelect")} />
						</div>

						<div className="flex flex-col gap-1">
							<label className="text-[11px] font-medium text-gray-500">{t("paymentStatus")}</label>
							<Select options={statusOptions} value={statusOptions.find((o) => String(o.value) === String(localFilters.status)) || statusOptions[0]} onChange={(opt) => setLocalFilters({ ...localFilters, status: opt?.value ?? "all" })} styles={selectStyles} components={{ DropdownIndicator, IndicatorSeparator: () => null }} placeholder={t("pleaseSelect")} />
						</div>

						<div className="flex flex-col gap-1">
							<label className="text-[11px] font-medium text-gray-500">{t("logisticsStatus")}</label>
							<Select options={shippingStatusOptions} value={shippingStatusOptions.find((o) => o.value === localFilters.shippingStatus) || shippingStatusOptions[0]} onChange={(opt) => setLocalFilters({ ...localFilters, shippingStatus: opt?.value ?? "all" })} styles={selectStyles} components={{ DropdownIndicator, IndicatorSeparator: () => null }} placeholder={t("pleaseSelect")} />
						</div>

						<div className="flex flex-col gap-1">
							<label className="text-[11px] font-medium text-gray-500">{t("country") || "Country"}</label>
							<Select options={countryOptions} value={countryOptions.find((o) => o.alpha2 === localFilters.country) || null} onChange={(opt) => setLocalFilters({ ...localFilters, country: opt?.alpha2 || null })} styles={selectStyles} components={{ DropdownIndicator, IndicatorSeparator: () => null }} placeholder={t("pleaseSelect")} isClearable />
						</div>

						<CalendarPicker label={t("startTime")} value={localFilters.startTime} onChange={(ts) => setLocalFilters({ ...localFilters, startTime: ts })} t={t} lang={lang} isEnd={false} maxDate={localFilters.endTime ? new Date(localFilters.endTime * 1000) : new Date()} />
						<CalendarPicker label={t("endTime")} value={localFilters.endTime} onChange={(ts) => setLocalFilters({ ...localFilters, endTime: ts })} t={t} lang={lang} isEnd={true} minDate={localFilters.startTime ? new Date(localFilters.startTime * 1000) : null} maxDate={new Date()} />
					</div>

					{/* Actions Footer inside Absolute Container */}
					<div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-50">
						<button onClick={handleReset} disabled={loading} className="px-4 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
							{t("reset")}
						</button>
						<button onClick={handleSearch} disabled={loading} className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
							{loading && <FontAwesomeIcon icon={faSpinner} spin />}
							{t("search")}
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
