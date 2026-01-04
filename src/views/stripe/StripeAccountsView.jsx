import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setModal } from "../../store/slices/ui.js";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { fetchStripeAccounts, deleteStripeAccount, updateStripeAccount } from "../../controllers/stripeController.js";
import { Pagination } from "../../components/common/Pagination.jsx";
import { StripeAccountModal } from "./StripeAccountModal.jsx";
import { StripeWarningModal } from "./StripeWarningModal.jsx";
import { StripeDisputeModal } from "./StripeDisputeModal.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCopy, faPen, faTrash, faEye, faExclamationTriangle, faGavel, faFilter, faChevronUp, faChevronDown, faTimes } from "@fortawesome/free-solid-svg-icons";
import Select, { components } from "react-select";
import { fetchUserListN } from "../../controllers/usersController.js";
import { setAllUsers } from "../../store/slices/users.js";
import { db } from "../../utils/indexedDB.js";
import { getPaymentTypeOptions } from "../../utils/paymentUtils.js";
import { getStripeAccountStatusOptions, getStripeAccountStatusInfo } from "../../utils/stripeStatusUtils.js";
import { useResponsive } from "../../hooks/useResponsive.js";

const DropdownIndicator = (props) => (
	<components.DropdownIndicator {...props}>
		<FontAwesomeIcon icon={faChevronDown} className="text-gray-400 text-[10px]" />
	</components.DropdownIndicator>
);

const InputField = ({ label, value, onChange, placeholder, type = "text" }) => (
	<div className="flex flex-col gap-1">
		<label className="text-[11px] font-medium text-gray-500">{label}</label>
		<input type={type} value={value} onChange={onChange} placeholder={placeholder} className="w-full h-8 px-3 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-colors" />
	</div>
);

const MobileWhitelist = ({ list }) => {
	const [expanded, setExpanded] = useState(false);
	return (
		<div
			onClick={(e) => {
				e.stopPropagation();
				setExpanded(!expanded);
			}}
			className="cursor-pointer">
			<div className={`flex gap-1 flex-wrap transition-all ${expanded ? "" : "max-h-[60px] overflow-hidden"}`}>
				{list.map((w, idx) => (
					<span key={idx} className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-1 rounded text-[10px] uppercase">
						{w.country_code}
					</span>
				))}
			</div>
			{!expanded && list.length > 15 && <div className="text-center text-[10px] text-gray-400 mt-1">...</div>}
		</div>
	);
};

export function StripeAccountsView() {
	const { t } = useI18n();
	const dispatch = useDispatch();
	const { isMobile, isTablet } = useResponsive();
	const allUsers = useSelector((s) => s.users.allUsers);
	const [list, setList] = useState([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [loading, setLoading] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState(null);
	const [isReadOnly, setIsReadOnly] = useState(false);
	const [warningModalOpen, setWarningModalOpen] = useState(false);
	const [disputeModalOpen, setDisputeModalOpen] = useState(false);
	const [selectedAccountId, setSelectedAccountId] = useState(null);
	const [userOptions, setUserOptions] = useState([]);
	const [expandedMobileRow, setExpandedMobileRow] = useState(null);
	const [editingRemarkId, setEditingRemarkId] = useState(null);
	const [editingRemarkValue, setEditingRemarkValue] = useState("");
	const containerRef = useRef(null);

	// Filters state
	const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
	const [filters, setFilters] = useState({
		comment: "",
		userId: "",
		paymentType: "",
		status: "",
	});

	const paymentTypeOptions = getPaymentTypeOptions(t);
	const statusOptions = getStripeAccountStatusOptions(t);

	useEffect(() => {
		if (isInitialized) {
			loadData();
		}
	}, [page, pageSize, isInitialized]);

	useEffect(() => {
		if (allUsers.length > 0) {
			const opts = allUsers.map((u) => ({ value: u.id, label: u.username }));
			setUserOptions(opts);
		} else {
			fetchUserListN().then((res) => {
				if (res.ok) {
					const list = Array.isArray(res.data) ? res.data : res.data?.list || [];
					dispatch(setAllUsers(list));
				}
			});
		}

		// Close filters when clicking outside
		function handleClickOutside(event) {
			if (containerRef.current && !containerRef.current.contains(event.target)) {
				setIsFiltersExpanded(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [allUsers]);

	const loadData = async (currentFilters, currentPage, currentPageSize) => {
		setLoading(true);
		const activeFilters = currentFilters || filters;
		const activePage = currentPage || page;
		const activePageSize = currentPageSize || pageSize;
		const params = {
			page: activePage,
			per_page: activePageSize,
			comment: activeFilters.comment || undefined,
			user_id: activeFilters.userId || undefined,
			paymentType: activeFilters.paymentType !== "" ? activeFilters.paymentType : undefined,
			status: activeFilters.status !== "" ? activeFilters.status : undefined,
		};
		const res = await fetchStripeAccounts(params);
		if (res.ok) {
			setList(res.data.list);
			setTotal(res.data.total);
		}
		setLoading(false);
	};

	// Load filters from IndexedDB on mount
	useEffect(() => {
		const loadFilters = async () => {
			try {
				const cached = await db.get("stripe_accounts_filters_cache");
				if (cached) {
					const { page: cachedPage, pageSize: cachedPageSize, ...cachedFilters } = cached;
					setFilters(cachedFilters);
					if (cachedPage) setPage(cachedPage);
					if (cachedPageSize) setPageSize(cachedPageSize);
				}
			} catch (error) {
				console.error("Failed to load filters from IndexedDB:", error);
			} finally {
				setIsInitialized(true);
			}
		};
		loadFilters();
	}, []);

	const onPageChange = (p) => {
		setPage(p);
		const cacheData = { ...filters, page: p, pageSize };
		db.set("stripe_accounts_filters_cache", cacheData);
	};

	const onPageSizeChange = (s) => {
		setPageSize(s);
		setPage(1);
		const cacheData = { ...filters, page: 1, pageSize: s };
		db.set("stripe_accounts_filters_cache", cacheData);
	};

	const handleResetFilters = () => {
		db.del("stripe_accounts_filters_cache");
		const resetFilters = {
			comment: "",
			userId: "",
			paymentType: "",
			status: "",
		};
		setFilters(resetFilters);
		setPage(1);
		if (page === 1) {
			loadData(resetFilters);
		}
		setIsFiltersExpanded(false);
	};

	const handleSearch = () => {
		const cacheData = { ...filters };
		db.set("stripe_accounts_filters_cache", cacheData);
		setPage(1);
		if (page === 1) {
			loadData();
		}
		setIsFiltersExpanded(false);
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

	const handleCreate = () => {
		setEditingItem(null);
		setIsReadOnly(false);
		setIsModalOpen(true);
	};

	const handleEdit = (item) => {
		setEditingItem(item);
		setIsReadOnly(false);
		setIsModalOpen(true);
	};

	const handleView = (item) => {
		setEditingItem(item);
		setIsReadOnly(true);
		setIsModalOpen(true);
	};

	const handleDelete = (item) => {
		dispatch(
			setModal({
				title: t("delete"),
				message: `${t("confirmDelete")} ${t("deleteAccountWarning")}`,
				variant: "danger",
				showCancel: true,
				confirmText: t("delete"),
				cancelText: t("cancel"),
				onConfirm: () => confirmDelete(item),
			})
		);
	};

	const confirmDelete = async (item) => {
		const res = await deleteStripeAccount(item.id);
		if (res.ok) {
			dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "success", message: t("deleteSuccess") } });
			loadData();
		} else {
			dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "error", message: res.error?.message || t("deleteFailed") } });
		}
	};

	const handleCopy = (text) => {
		if (!text) return;
		navigator.clipboard
			.writeText(text)
			.then(() => {
				dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "success", message: t("copied") } });
			})
			.catch(() => {
				dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "error", message: t("copyFailed") } });
			});
	};

	const activeFiltersList = [];
	if (filters.comment) {
		activeFiltersList.push({ key: "comment", label: t("paymentChannel"), value: filters.comment });
	}
	if (filters.userId) {
		const userLabel = userOptions.find((u) => u.value === filters.userId)?.label || filters.userId;
		activeFiltersList.push({ key: "userId", label: t("username"), value: userLabel });
	}
	if (filters.paymentType !== "") {
		const label = paymentTypeOptions.find((o) => o.value === filters.paymentType)?.label || filters.paymentType;
		activeFiltersList.push({ key: "paymentType", label: t("paymentType"), value: label });
	}
	if (filters.status !== "") {
		const label = statusOptions.find((o) => o.value === filters.status)?.label || filters.status;
		activeFiltersList.push({ key: "status", label: t("st_status"), value: label });
	}

	const removeFilter = (key) => {
		const newFilters = { ...filters, [key]: "" };
		setFilters(newFilters);
		const cacheData = { ...newFilters, page: 1, pageSize };
		db.set("stripe_accounts_filters_cache", cacheData);
		if (page === 1) {
			loadData(newFilters);
		} else {
			setPage(1);
		}
	};

	const handleRemarkEdit = (item) => {
		setEditingRemarkId(item.id);
		setEditingRemarkValue(item.description || "");
	};

	const handleRemarkSave = async (item) => {
		if (editingRemarkValue === (item.description || "")) {
			setEditingRemarkId(null);
			return;
		}

		// Construct safe payload with allowed fields
		const safeFields = ["id", "status", "group_id", "comment", "api_key", "api_publishable_key", "endpoint_secret", "c_site_url", "max_money", "max_order", "description", "maximum_purchase_amount", "white_list", "country_group", "level", "type", "user_id", "paymentType"];
		const payload = {};
		safeFields.forEach((f) => {
			if (item[f] !== undefined) payload[f] = item[f];
		});
		payload.description = editingRemarkValue;

		// Optimistic update
		const originalList = [...list];
		setList(list.map((i) => (i.id === item.id ? { ...i, description: editingRemarkValue } : i)));
		setEditingRemarkId(null);

		const res = await updateStripeAccount(payload);
		if (!res.ok) {
			// Revert on failure
			setList(originalList);
			dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "error", message: res.error?.message || t("updateFailed") || "Update failed" } });
		} else {
			dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "success", message: t("updateSuccess") || "Update success" } });
		}
	};

	const handleRemarkKeyDown = (e, item) => {
		if (e.key === "Enter") {
			handleRemarkSave(item);
		} else if (e.key === "Escape") {
			setEditingRemarkId(null);
		}
	};

	const renderKeys = (item) => (
		<div className="flex flex-col gap-1.5">
			{item.api_publishable_key && (
				<div className="group flex items-center gap-1 text-[10px] text-gray-500">
					<span className="font-medium w-6 flex-shrink-0">PK:</span>
					<span className="font-mono bg-gray-50 px-1 rounded truncate flex-1" title={item.api_publishable_key}>
						{item.api_publishable_key.substring(0, 8)}...{item.api_publishable_key.slice(-4)}
					</span>
					<button
						onClick={(e) => {
							e.stopPropagation();
							handleCopy(item.api_publishable_key);
						}}
						className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 transition-opacity flex-shrink-0">
						<FontAwesomeIcon icon={faCopy} />
					</button>
				</div>
			)}
			{item.endpoint_secret && (
				<div className="group flex items-center gap-1 text-[10px] text-gray-500">
					<span className="font-medium w-6 flex-shrink-0">SK:</span>
					<span className="font-mono bg-gray-50 px-1 rounded truncate flex-1" title={item.endpoint_secret}>
						{item.endpoint_secret.substring(0, 8)}...{item.endpoint_secret.slice(-4)}
					</span>
					<button
						onClick={(e) => {
							e.stopPropagation();
							handleCopy(item.endpoint_secret);
						}}
						className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 transition-opacity flex-shrink-0">
						<FontAwesomeIcon icon={faCopy} />
					</button>
				</div>
			)}
			{item.api_key && (
				<div className="group flex items-center gap-1 text-[10px] text-gray-500">
					<span className="font-medium w-6 flex-shrink-0">WH:</span>
					<span className="font-mono bg-gray-50 px-1 rounded truncate flex-1" title={item.api_key}>
						{item.api_key.substring(0, 8)}...{item.api_key.slice(-4)}
					</span>
					<button
						onClick={(e) => {
							e.stopPropagation();
							handleCopy(item.api_key);
						}}
						className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 transition-opacity flex-shrink-0">
						<FontAwesomeIcon icon={faCopy} />
					</button>
				</div>
			)}
		</div>
	);

	return (
		<div className="p-6">
			<div className="bg-white rounded-2xl shadow p-4">
				<div className="relative flex flex-col gap-4 mb-4" ref={containerRef}>
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-semibold text-gray-900">{t("stripeAccounts")}</h3>
						<div className="flex flex-wrap items-center justify-end gap-2">
							{/* Active Filter Chips */}
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

							<button onClick={() => setIsFiltersExpanded(!isFiltersExpanded)} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${isFiltersExpanded ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
								<FontAwesomeIcon icon={faFilter} />
								{t("filter")}
								<FontAwesomeIcon icon={isFiltersExpanded ? faChevronUp : faChevronDown} className="ml-1" />
							</button>
							<button onClick={handleCreate} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-brand rounded-lg hover:bg-blue-700 transition-colors">
								<FontAwesomeIcon icon={faPlus} />
								{t("addNew")}
							</button>
						</div>
					</div>

					{/* Collapsible Filters - Absolute Positioned */}
					{isFiltersExpanded && (
						<div className="absolute top-full left-0 right-0 z-50 p-4 bg-white shadow-xl border border-gray-100 rounded-xl mt-1">
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
								<InputField label={t("paymentChannel") || "Payment Channel"} value={filters.comment} onChange={(e) => setFilters({ ...filters, comment: e.target.value })} placeholder={t("enterPaymentChannel") || "Enter Payment Channel..."} />
								<div className="flex flex-col gap-1">
									<label className="text-[11px] font-medium text-gray-500">{t("username") || "Username"}</label>
									<Select className="hs-custom-select" options={userOptions} value={userOptions.find((o) => o.value === filters.userId) || null} onChange={(opt) => setFilters({ ...filters, userId: opt?.value || "" })} styles={selectStyles} components={{ DropdownIndicator, IndicatorSeparator: () => null }} placeholder={t("selectUser") || "Select User"} isClearable />
								</div>
								<div className="flex flex-col gap-1">
									<label className="text-[11px] font-medium text-gray-500">{t("paymentType") || "Payment Type"}</label>
									<Select className="hs-custom-select" options={paymentTypeOptions} value={paymentTypeOptions.find((o) => o.value === filters.paymentType) || null} onChange={(opt) => setFilters({ ...filters, paymentType: opt !== null ? opt.value : "" })} styles={selectStyles} components={{ DropdownIndicator, IndicatorSeparator: () => null }} placeholder={t("selectPaymentType") || "Select..."} isClearable />
								</div>
								<div className="flex flex-col gap-1">
									<label className="text-[11px] font-medium text-gray-500">{t("st_status") || "Status"}</label>
									<Select className="hs-custom-select" options={statusOptions} value={statusOptions.find((o) => o.value === filters.status) || null} onChange={(opt) => setFilters({ ...filters, status: opt !== null ? opt.value : "" })} styles={selectStyles} components={{ DropdownIndicator, IndicatorSeparator: () => null }} placeholder={t("selectStatus") || "Select..."} isClearable />
								</div>
							</div>
							<div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-50">
								<button onClick={handleResetFilters} disabled={loading} className="px-4 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
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

				{loading ? (
					<div className="p-8 text-center text-gray-500">{t("loading")}</div>
				) : (
					<div className="mt-3">
						{isMobile ? (
							<div className="space-y-3">
								{list.map((item) => {
									const createDate = item.createtime ? new Date(item.createtime * 1000).toLocaleString() : "-";
									const updateDate = item.updatetime ? new Date(item.updatetime * 1000).toLocaleString() : "-";
									const isExpanded = expandedMobileRow === item.id;

									return (
										<div key={item.id} className={`bg-white rounded-lg shadow-sm border transition-all box-border ${isExpanded ? "border-blue-500" : "border-gray-100"}`} onClick={() => setExpandedMobileRow(isExpanded ? null : item.id)}>
											{/* Header / Summary Row */}
											<div className="p-3 flex items-center justify-between gap-3">
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2 mb-1">
														<span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px] font-mono">ID: {item.id}</span>
														<span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${item.type === 0 ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`} title={t("st_type")}>
															{item.type === 0 ? t("stTypePhishing") : t("stTypeNormal")}
														</span>
													</div>
													<div className="font-medium text-gray-900 truncate text-sm" title={item.comment}>
														{item.comment || "-"}
													</div>
													<div className="flex items-center gap-2 mt-1">
														{(() => {
															const statusInfo = getStripeAccountStatusInfo(item.status, t);
															const colorClass =
																{
																	gray: "bg-gray-100 text-gray-800",
																	green: "bg-green-100 text-green-800",
																	blue: "bg-blue-100 text-blue-800",
																	red: "bg-red-100 text-red-800",
																}[statusInfo.color] || "bg-gray-100 text-gray-800";
															return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${colorClass}`}>{statusInfo.label}</span>;
														})()}
														<div className="flex items-center gap-1 text-[10px]">
															<span className="text-gray-500">{t("st_money_sum")}:</span>
															<span className="font-medium text-blue-600">${item.money_sum || 0}</span>
														</div>
													</div>
												</div>
												<div onClick={(e) => e.stopPropagation()}>
													<div className="flex items-center gap-1">
														<button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title={t("edit")}>
															<FontAwesomeIcon icon={faPen} />
														</button>
														<button onClick={() => handleDelete(item)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title={t("delete")}>
															<FontAwesomeIcon icon={faTrash} />
														</button>
													</div>
												</div>
											</div>

											{/* Expanded Content */}
											<div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
												<div className="overflow-hidden">
													<div className="px-3 pb-3 pt-0 text-xs text-gray-600 space-y-2 border-t border-gray-50 mt-1">
														{/* Site URL */}
														<div className="pt-2">
															<span className="text-gray-400 block mb-0.5">{t("st_site")}</span>
															{item.c_site_url ? (
																<a href={item.c_site_url.replace(/[`\s]/g, "")} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium break-all" onClick={(e) => e.stopPropagation()}>
																	{item.c_site_url.replace(/[`\s]/g, "")}
																</a>
															) : (
																"-"
															)}
														</div>

														{/* Keys */}
														<div>
															<span className="text-gray-400 block mb-0.5">{t("st_keys")}</span>
															{renderKeys(item)}
														</div>

														{/* Limits & Stats */}
														<div className="grid grid-cols-2 gap-3 bg-gray-50 p-2 rounded">
															<div>
																<span className="text-gray-400 block mb-0.5">{t("st_limits")}</span>
																<div className="flex flex-col gap-0.5 text-[10px]">
																	<div className="flex justify-between">
																		<span>{t("st_max_money")}:</span> <span className="font-medium">${item.max_money}</span>
																	</div>
																	<div className="flex justify-between">
																		<span>{t("st_max_order")}:</span> <span className="font-medium">{item.max_order}</span>
																	</div>
																</div>
															</div>
															<div>
																<span className="text-gray-400 block mb-0.5">{t("st_stats")}</span>
																<div className="flex flex-col gap-0.5 text-[10px]">
																	<div className="flex justify-between">
																		<span>{t("st_today_order_amount_sum")}:</span> <span className="font-medium text-red-600">${item.today_order_amount}</span>
																	</div>
																	<div className="flex justify-between">
																		<span>{t("st_money_sum")}:</span> <span className="font-medium text-blue-600">${item.money_sum}</span>
																	</div>
																</div>
															</div>
														</div>

														{/* Whitelist */}
														{item.white_list && item.white_list.length > 0 && (
															<div>
																<span className="text-gray-400 block mb-0.5">{t("st_whitelist")}</span>
																<MobileWhitelist list={item.white_list} />
															</div>
														)}

														{/* Dates */}
														<div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400">
															<div>
																{t("createTime")}: {createDate}
															</div>
															<div>
																{t("upd")}: {updateDate}
															</div>
														</div>

														{/* Extra Actions */}
														<div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
															<button
																onClick={(e) => {
																	e.stopPropagation();
																	setWarningModalOpen(true);
																	setSelectedAccountId(item.id);
																}}
																className="px-2 py-1 text-xs bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100">
																<FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
																{t("warning")}
															</button>
															<button
																onClick={(e) => {
																	e.stopPropagation();
																	setDisputeModalOpen(true);
																	setSelectedAccountId(item.id);
																}}
																className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100">
																<FontAwesomeIcon icon={faGavel} className="mr-1" />
																{t("dispute")}
															</button>
														</div>
													</div>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						) : (
							<table className="w-full text-xs table-fixed">
								<thead className="bg-gray-100">
									<tr>
										<th className={`px-3 py-3 text-left font-medium text-gray-700 ${isTablet ? "w-[15%]" : "w-[12%]"}`}>
											{t("st_group")} / {t("st_comment")}
										</th>
										<th className={`px-3 py-3 text-left font-medium text-gray-700 ${isTablet ? "w-[15%]" : "w-[12%]"}`}>{t("st_site")}</th>
										<th className={`px-3 py-3 text-left font-medium text-gray-700 ${isTablet ? "w-[10%]" : "w-[8%]"}`}>{t("st_status")}</th>
										<th className={`px-3 py-3 text-left font-medium text-gray-700 ${isTablet ? "w-[15%]" : "w-[12%]"}`}>{t("remark") || "Remark"}</th>
										{!isTablet && <th className="px-3 py-3 text-left font-medium text-gray-700 w-[10%]">{t("st_whitelist")}</th>}
										{/* {!isTablet && <th className="px-3 py-3 text-left font-medium text-gray-700 w-[10%]">{t("st_keys")}</th>} */}
										<th className={`px-3 py-3 text-left font-medium text-gray-700 ${isTablet ? "w-[20%]" : "w-[10%]"}`}>{t("st_limits")}</th>
										<th className={`px-3 py-3 text-left font-medium text-gray-700 ${isTablet ? "w-[15%]" : "w-[8%]"}`}>{t("st_stats")}</th>
										{!isTablet && <th className="px-3 py-3 text-left font-medium text-gray-700 w-[10%]">{t("st_dates")}</th>}
										<th className={`px-3 py-3 text-left font-medium text-gray-700 ${isTablet ? "w-[10%]" : "w-[10%]"}`}>{t("actions")}</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-100">
									{list.length === 0 ? (
										<tr>
											<td colSpan={isTablet ? 7 : 10} className="px-4 py-8 text-center text-gray-400">
												{t("noData")}
											</td>
										</tr>
									) : (
										list.map((item) => {
											const createDate = item.createtime ? new Date(item.createtime * 1000).toLocaleString() : "-";
											const updateDate = item.updatetime ? new Date(item.updatetime * 1000).toLocaleString() : "-";

											return (
												<tr key={item.id} className="hover:bg-gray-50 transition-colors align-top border-t">
													{/* Account Details */}
													<td className="p-3 overflow-hidden">
														<div className="flex flex-col gap-1.5">
															<div className="flex items-center gap-2 flex-wrap">
																<span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px] font-mono">
																	{t("owner") || "Owner"}: <span className="text-[12px] text-peach font-bold italic">{item.username}</span>{" "}
																</span>
																{item.level !== undefined && (
																	<span className="bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded text-[10px] font-medium" title={t("st_level") || "Level"}>
																		Lv.{item.level}
																	</span>
																)}
																<span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${item.type === 0 ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`} title={t("st_type") || "Type"}>
																	{item.type === 0 ? t("stTypePhishing") || "Phishing" : t("stTypeNormal") || "Normal"}
																</span>
															</div>
															<div className="font-medium text-gray-900 truncate" title={item.comment}>
																{item.comment || "-"}
															</div>
														</div>
													</td>

													{/* Site */}
													<td className="p-3 overflow-hidden">
														<div className="flex flex-col gap-1.5">
															<div className="text-blue-600 truncate">
																{item.c_site_url ? (
																	<a href={item.c_site_url.replace(/[`\s]/g, "")} target="_blank" rel="noreferrer" className="hover:underline font-medium" title={item.c_site_url}>
																		{item.c_site_url.replace(/[`\s]/g, "")}
																	</a>
																) : (
																	"-"
																)}
															</div>
														</div>
													</td>

													{/* Status */}
													<td className="p-3">
														<div className="flex items-center gap-2 flex-wrap">
															{(() => {
																const statusInfo = getStripeAccountStatusInfo(item.status, t);
																const colorClass =
																	{
																		gray: "bg-gray-100 text-gray-800",
																		green: "bg-green-100 text-green-800",
																		blue: "bg-blue-100 text-blue-800",
																		red: "bg-red-100 text-red-800",
																	}[statusInfo.color] || "bg-gray-100 text-gray-800";
																return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${colorClass}`}>{statusInfo.label}</span>;
															})()}
														</div>
													</td>

													{/* Remark */}
													<td
														className="p-3"
														onClick={(e) => {
															e.stopPropagation();
															handleRemarkEdit(item);
														}}>
														{editingRemarkId === item.id ? (
															<input type="text" value={editingRemarkValue} onChange={(e) => setEditingRemarkValue(e.target.value)} onBlur={() => handleRemarkSave(item)} onKeyDown={(e) => handleRemarkKeyDown(e, item)} className="w-full px-2 py-1 text-xs border border-blue-500 rounded focus:outline-none bg-white text-gray-900" autoFocus onClick={(e) => e.stopPropagation()} />
														) : (
															<div className="text-gray-600 text-xs break-all cursor-pointer hover:bg-gray-50 p-1 rounded min-h-[20px] transition-colors" title={t("clickToEdit") || "Click to edit"}>
																{item.description || "-"}
															</div>
														)}
													</td>

													{/* Whitelist (Hidden on Tablet) */}
													{!isTablet && (
														<td className="p-3 relative group">
															{item.white_list && item.white_list.length > 0 ? (
																<>
																	<div className="flex gap-1 flex-wrap ">
																		{item.white_list.slice(0, 3).map((w, idx) => (
																			<span key={idx} className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-1 rounded text-[10px] uppercase">
																				{w.country_code}
																			</span>
																		))}
																		{item.white_list.length > 3 && <span className="text-gray-400 text-[10px]">+{item.white_list.length - 3}</span>}
																	</div>
																	{/* Hover Tooltip */}
																	{/* <div className={`hidden absolute left-0 top-[1/2] mb-2 group-hover:block min-w-[200px] max-w-[300px] p-2 bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-lg shadow-xl z-[100] pointer-events-none transition-all animate-fade-in`}>
																		<div className="flex flex-wrap gap-1.5">
																			{item.white_list.map((w, idx) => (
																				<span key={idx} className="bg-gray-700/50 px-1.5 py-0.5 rounded text-[10px] uppercase border border-gray-600/50">
																					{w.country_code}
																				</span>
																			))}
																		</div>
																		<div className={`rotate-180 absolute left-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent bottom-full border-t-[6px] border-t-gray-900/95`}></div>
																	</div> */}
																</>
															) : (
																<span className="text-gray-400 text-[10px]">-</span>
															)}
														</td>
													)}

													{/* Keys (Hidden on Tablet) */}
													{/* {!isTablet && (
														<td className="p-3 overflow-hidden">
															{renderKeys(item)}
														</td>
													)} */}

													{/* Limits */}
													<td className="p-3 overflow-hidden">
														<div className="pr-2 flex flex-col gap-1.5 text-[10px]">
															<div className="flex justify-between items-center gap-2">
																<span className="text-gray-500 truncate">{t("st_max_money")}:</span>
																<span className="font-medium text-gray-900 truncate">${item.max_money || 0}</span>
															</div>
															<div className="flex justify-between items-center gap-2">
																<span className="text-gray-500 truncate">{t("st_max_order")}:</span>
																<span className="font-medium text-gray-900 truncate">{item.max_order || 0}</span>
															</div>
															{item.maximum_purchase_amount && (
																<div className="flex justify-between items-center gap-2">
																	<span className="text-gray-500 truncate">{t("st_max_purchase")}:</span>
																	<span className="font-medium text-gray-900 truncate">${item.maximum_purchase_amount || 0}</span>
																</div>
															)}
														</div>
													</td>

													{/* Stats */}
													<td className="p-3 overflow-hidden">
														<div className="flex flex-col gap-1.5 text-[10px]">
															<div className="flex justify-between items-center gap-2">
																<span className="text-gray-500 truncate">{t("st_today_order_amount_sum")}:</span>
																<span className="font-medium text-red-600 truncate">${item.today_order_amount || 0}</span>
															</div>
															<div className="flex justify-between items-center gap-2">
																<span className="text-gray-500 truncate">{t("st_money_sum")}:</span>
																<span className="font-medium text-blue-600 truncate">${item.money_sum || 0}</span>
															</div>
														</div>
													</td>

													{/* Dates (Hidden on Tablet) */}
													{!isTablet && (
														<td className="p-3 overflow-hidden">
															<div className="flex flex-col gap-1.5 text-[10px] text-gray-500">
																<div>
																	<div className="text-[9px] text-gray-400">{t("createTime")}</div>
																	<div className="truncate">{createDate}</div>
																</div>
																<div>
																	<div className="text-[9px] text-gray-400">{t("upd")}</div>
																	<div className="truncate">{updateDate}</div>
																</div>
															</div>
														</td>
													)}

													{/* Actions */}
													<td className="p-3">
														<div className="flex flex-col gap-2">
															<div className="flex flex-wrap gap-1">
																<button onClick={() => handleEdit(item)} className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors" title={t("edit")}>
																	<FontAwesomeIcon icon={faPen} />
																</button>
																<button onClick={() => handleDelete(item)} className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors" title={t("delete")}>
																	<FontAwesomeIcon icon={faTrash} />
																</button>
																<button onClick={() => handleView(item)} className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors" title={t("view")}>
																	<FontAwesomeIcon icon={faEye} />
																</button>

																<button
																	onClick={() => {
																		setWarningModalOpen(true);
																		setSelectedAccountId(item.id);
																	}}
																	className="p-1 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
																	title={t("warning")}>
																	<FontAwesomeIcon icon={faExclamationTriangle} />
																</button>
																<button
																	onClick={() => {
																		setDisputeModalOpen(true);
																		setSelectedAccountId(item.id);
																	}}
																	className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
																	title={t("dispute")}>
																	<FontAwesomeIcon icon={faGavel} />
																</button>
															</div>
															{/* <div className="flex gap-1">
																
															</div> */}
														</div>
													</td>
												</tr>
											);
										})
									)}
								</tbody>
							</table>
						)}
					</div>
				)}

				<div className="mt-3">
					<Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />
				</div>
			</div>

			<StripeAccountModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={loadData} initialData={editingItem} readOnly={isReadOnly} />
			<StripeWarningModal isOpen={warningModalOpen} onClose={() => setWarningModalOpen(false)} accountId={selectedAccountId} />
			<StripeDisputeModal isOpen={disputeModalOpen} onClose={() => setDisputeModalOpen(false)} accountId={selectedAccountId} />
		</div>
	);
}
