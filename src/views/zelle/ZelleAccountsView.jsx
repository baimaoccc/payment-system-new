import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setModal } from "../../store/slices/ui.js";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { fetchStripeAccounts, deleteStripeAccount } from "../../controllers/stripeController.js";
import { Pagination } from "../../components/common/Pagination.jsx";
import { ZelleAccountModal } from "./ZelleAccountModal.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCopy, faPen, faTrash, faEye, faExclamationTriangle, faGavel, faFilter, faChevronUp, faChevronDown, faTimes, faSpinner, faLink } from "@fortawesome/free-solid-svg-icons";
import Select, { components } from "react-select";
import { fetchUserListN } from "../../controllers/usersController.js";
import { setAllUsers } from "../../store/slices/users.js";
import { db } from "../../utils/indexedDB.js";
import { getStripeAccountStatusOptions, getStripeAccountStatusInfo } from "../../utils/stripeStatusUtils.js";
import { useResponsive } from "../../hooks/useResponsive.js";
import { request } from "../../plugins/http/baseAPI.js";
import { API_ZELLE_AUTHORIZE } from "../../constants/api.js";
import axios from "axios";
import { Roles } from "../../plugins/rbac/index.js";

const FILTERS_CACHE_KEY = "zelle_accounts_filters_cache";

const DropdownIndicator = (props) => (
	<components.DropdownIndicator {...props}>
		<FontAwesomeIcon icon={faChevronDown} className="text-gray-400 text-[10px]" />
	</components.DropdownIndicator>
);

const InputField = ({ label, value, onChange, placeholder, type = "text" }) => (
	<div className="flex flex-col gap-1">
		<label className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{label}</label>
		<input type={type} value={value} onChange={onChange} placeholder={placeholder} className="w-full h-8 px-3 border border-gray-200 dark:border-gray-700/50 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors" />
	</div>
);



export function ZelleAccountsView() {
	const { t } = useI18n();
	const dispatch = useDispatch();
	const { isMobile, isTablet } = useResponsive();
	const theme = useSelector((s) => s.ui?.theme || "light");
	const isDark = theme === "dark";
	const allUsers = useSelector((s) => s.users.allUsers);
	const userRole = useSelector((s) => s.auth?.role || s.auth?.user?.role || "");
	const isSuperAdmin = userRole === Roles.admin || userRole === "super_admin";
	const [list, setList] = useState([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [loading, setLoading] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState(null);
	const [isReadOnly, setIsReadOnly] = useState(false);
			const [selectedAccountId, setSelectedAccountId] = useState(null);
	const [userOptions, setUserOptions] = useState([]);
	const [expandedMobileRow, setExpandedMobileRow] = useState(null);
	const containerRef = useRef(null);

	const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
	const [filters, setFilters] = useState({
		comment: "",
		userId: "",
		status: "",
		type: "0,3"
	});

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
			status: activeFilters.status !== "" ? activeFilters.status : undefined,
			type: activeFilters.type || "3",
		};
		const res = await fetchStripeAccounts(params);
		if (res.ok) {
			setList(res.data.list);
			setTotal(res.data.total);
		}
		setLoading(false);
	};

	useEffect(() => {
		const loadFilters = async () => {
			try {
				const cached = await db.get(FILTERS_CACHE_KEY);
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
		db.set(FILTERS_CACHE_KEY, cacheData);
	};

	const onPageSizeChange = (s) => {
		setPageSize(s);
		setPage(1);
		const cacheData = { ...filters, page: 1, pageSize: s };
		db.set(FILTERS_CACHE_KEY, cacheData);
	};

	const handleResetFilters = () => {
		db.del(FILTERS_CACHE_KEY);
		const resetFilters = {
			comment: "",
			userId: "",
			status: "",
			type: "3"
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
		db.set(FILTERS_CACHE_KEY, cacheData);
		setPage(1);
		if (page === 1) {
			loadData();
		}
		setIsFiltersExpanded(false);
	};

	const selectStyles = {
		control: (base, state) => ({
			...base,
			minHeight: 32,
			height: 32,
			borderRadius: 6,
			backgroundColor: isDark ? (state.isFocused ? "#374151" : "#1F2937") : (state.isFocused ? "white" : "#f9fafb"),
			borderColor: isDark ? (state.isFocused ? "#3B82F6" : "rgba(55, 65, 81, 0.5)") : (state.isFocused ? "#3B82F6" : "#e5e7eb"),
			borderWidth: 1,
			boxShadow: "none",
			paddingLeft: 2,
			paddingRight: 2,
			fontSize: 12,
			"&:hover": { borderColor: isDark ? "#6B7280" : "#d1d5db" },
		}),
		valueContainer: (base) => ({ ...base, padding: "0 4px" }),
		indicatorsContainer: (base) => ({ ...base, padding: 0 }),
		dropdownIndicator: (base, state) => ({ ...base, color: state.isFocused ? (isDark ? "#60A5FA" : "#3B82F6") : (isDark ? "#9CA3AF" : "#6b7280"), padding: 4 }),
		indicatorSeparator: () => ({ display: "none" }),
		singleValue: (base) => ({ ...base, color: isDark ? "#D1D5DB" : "#374151" }),
		input: (base) => ({ ...base, color: isDark ? "#D1D5DB" : "#374151" }),
		option: (base, state) => ({
			...base,
			fontSize: 12,
			padding: "6px 10px",
			backgroundColor: state.isFocused ? (isDark ? "#374151" : "#eff6ff") : state.isSelected ? (isDark ? "#1E3A8A" : "#dbeafe") : isDark ? "#1F2937" : "white",
			color: isDark ? "#D1D5DB" : "#374151",
			cursor: "pointer",
		}),
		menuPortal: (base) => ({ ...base, zIndex: 9999 }),
		menu: (base) => ({ ...base, borderRadius: 6, backgroundColor: isDark ? "#1F2937" : "white", border: isDark ? "1px solid #374151" : "1px solid #F3F4F6", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)", zIndex: 60 }),
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

	const handleAuthorize = (item) => {
		dispatch(
			setModal({
				title: t("authorize") || "Authorize",
				message: t("confirmAuthorize") || "Are you sure you want to authorize this account?",
				variant: "info",
				showCancel: true,
				confirmText: t("confirm") || "Confirm",
				cancelText: t("cancel") || "Cancel",
				onConfirm: () => confirmAuthorize(item),
			})
		);
	};

	const confirmAuthorize = async (item) => {
		try {
			const authUrl = "https://outlook.doylear.space/Api/Authorization/login";
			
			const res = await axios.post(authUrl, {
				account_id: item.id
			});
			
			const data = res.data;
			
			if (data && data.code == 1 && data.data?.Location) {
				// The Location URL might contain spaces at the beginning or end
				const redirectUrl = data.data.Location.trim();
				dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "success", message: t("authorizeSuccess") || "Authorization successful, redirecting..." } });
				window.open(redirectUrl, '_blank');
			} else {
				dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "error", message: data.msg || data.message || t("authorizeFailed") || "Authorization failed" } });
			}
		} catch (error) {
			const errorMsg = error.response?.data?.msg || error.response?.data?.message || error.message || t("authorizeFailed") || "Authorization failed";
			dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "error", message: errorMsg } });
		}
	};



	const activeFiltersList = [];
	if (filters.comment) {
		activeFiltersList.push({ key: "comment", label: t("zelleEmail") || "Email", value: filters.comment });
	}
	if (filters.userId) {
		const userLabel = userOptions.find((u) => u.value === filters.userId)?.label || filters.userId;
		activeFiltersList.push({ key: "userId", label: t("username"), value: userLabel });
	}
	if (filters.status !== "") {
		const label = statusOptions.find((o) => o.value === filters.status)?.label || filters.status;
		activeFiltersList.push({ key: "status", label: t("st_status"), value: label });
	}

	const removeFilter = (key) => {
		const newFilters = { ...filters, [key]: "" };
		setFilters(newFilters);
		const cacheData = { ...newFilters, page: 1, pageSize };
		db.set(FILTERS_CACHE_KEY, cacheData);
		if (page === 1) {
			loadData(newFilters);
		} else {
			setPage(1);
		}
	};





	return (
		<div className="p-6">
			<div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4">
				<div className="relative flex flex-col gap-4 mb-4" ref={containerRef}>
					<h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex-shrink-0">{t("zelleAccounts") || "Zelle Accounts"}</h3>
					<div className="flex items-center justify-between">
						<div className="flex flex-wrap items-center justify-end gap-2">
							{activeFiltersList.map((filter) => (
								<div key={filter.key} className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50 text-xs rounded-md animate-fade-in">
									<span className="font-medium">{filter.label}:</span>
									<span className="max-w-[100px] truncate" title={filter.value}>
										{filter.value}
									</span>
									<button onClick={() => removeFilter(filter.key)} className="ml-1 text-blue-400 hover:text-blue-600 focus:outline-none transition-colors">
										<FontAwesomeIcon icon={faTimes} />
									</button>
								</div>
							))}

							<div className="flex items-center gap-x-2 flex-wrap">
								<button onClick={() => setIsFiltersExpanded(!isFiltersExpanded)} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${isFiltersExpanded ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700/50 hover:bg-gray-50 dark:bg-gray-900"}`}>
									<FontAwesomeIcon icon={faFilter} />
									{t("filter")}
									<FontAwesomeIcon icon={isFiltersExpanded ? faChevronUp : faChevronDown} className="ml-1" />
								</button>
								{isSuperAdmin && (
									<button onClick={handleCreate} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-brand rounded-lg hover:bg-blue-700 transition-colors">
										<FontAwesomeIcon icon={faPlus} />
										{t("addNew")}
									</button>
								)}
							</div>
						</div>
					</div>

					{isFiltersExpanded && (
						<div className="absolute top-full left-0 right-0 z-50 p-4 bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700/50 rounded-xl mt-1">
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
								<InputField label={t("zelleEmail") || "Email"} value={filters.comment} onChange={(e) => setFilters({ ...filters, comment: e.target.value })} placeholder={t("search") || "Search..."} />
								<div className="flex flex-col gap-1">
									<label className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{t("username") || "Username"}</label>
									<Select className="hs-custom-select" options={userOptions} value={userOptions.find((o) => o.value === filters.userId) || null} onChange={(opt) => setFilters({ ...filters, userId: opt?.value || "" })} styles={selectStyles} components={{ DropdownIndicator, IndicatorSeparator: () => null }} placeholder={t("selectUser") || "Select User"} isClearable />
								</div>
								<div className="flex flex-col gap-1">
									<label className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{t("st_status") || "Status"}</label>
									<Select className="hs-custom-select" options={statusOptions} value={statusOptions.find((o) => o.value === filters.status) || null} onChange={(opt) => setFilters({ ...filters, status: opt !== null ? opt.value : "" })} styles={selectStyles} components={{ DropdownIndicator, IndicatorSeparator: () => null }} placeholder={t("selectStatus") || "Select..."} isClearable />
								</div>
							</div>
							<div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-50 dark:border-gray-700/50">
								<button onClick={handleResetFilters} disabled={loading} className="px-4 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700/50 hover:bg-gray-100 dark:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
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
					<div className="p-8 text-center text-gray-500 dark:text-gray-400">{t("loading")}</div>
				) : (
					<div className="mt-3">
						{isMobile ? (
							<div className="space-y-3">
								{list.map((item) => {
									const createDate = item.createtime ? new Date(item.createtime * 1000).toLocaleString() : "-";
									const updateDate = item.updatetime ? new Date(item.updatetime * 1000).toLocaleString() : "-";
									const isExpanded = expandedMobileRow === item.id;

									return (
										<div key={item.id} className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border transition-all box-border ${isExpanded ? "border-blue-500" : "border-gray-100 dark:border-gray-700/50"}`} onClick={() => setExpandedMobileRow(isExpanded ? null : item.id)}>
											<div className="p-3 flex items-center justify-between gap-3">
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2 mb-1">
														<span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded text-[10px] font-mono">ID: {item.id}</span>
													</div>
													<div className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm" title={item.comment}>
														{item.comment || "-"}
													</div>
													<div className="flex flex-col gap-1 mt-1">
														<div className="flex items-center gap-2">
															{(() => {
																const statusInfo = getStripeAccountStatusInfo(item.status, t);
																const colorClass =
																	{
																		gray: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100",
																		green: "bg-green-100 text-green-800",
																		blue: "bg-blue-100 text-blue-800",
																		red: "bg-red-100 text-red-800",
																	}[statusInfo.color] || "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100";
																return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${colorClass}`}>{statusInfo.label}</span>;
															})()}
														</div>
													</div>
												</div>
												<div onClick={(e) => e.stopPropagation()}>
													<div className="flex items-center gap-1">
														{isSuperAdmin && (
															<button onClick={() => handleAuthorize(item)} className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors" title={t("authorize") || "Authorize"}>
																<FontAwesomeIcon icon={faLink} />
															</button>
														)}
														{isSuperAdmin && (
															<button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title={t("edit")}>
																<FontAwesomeIcon icon={faPen} />
															</button>
														)}
														{isSuperAdmin && (
															<button onClick={() => handleDelete(item)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title={t("delete")}>
																<FontAwesomeIcon icon={faTrash} />
															</button>
														)}
													</div>
												</div>
											</div>

											<div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
												<div className="overflow-hidden">
													<div className="px-3 pb-3 pt-0 text-xs text-gray-600 dark:text-gray-400 space-y-2 border-t border-gray-50 dark:border-gray-700/50 mt-1">
														<div className="pt-2">
															<span className="text-gray-400 block mb-0.5">{t("zelleAccountName") || "Account Name"}</span>
															<span className="font-medium">{item.bankAccountHolder || "-"}</span>
														</div>

														<div className="pt-2">
															<span className="text-gray-400 block mb-0.5">{t("owner") || "Owner"}</span>
															<span className="font-medium">{item.username || "-"}</span>
														</div>

														<div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400 mt-2">
															<div>
																{t("createTime")}: {createDate}
															</div>
															<div>
																{t("upd")}: {updateDate}
															</div>
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
								<thead className="bg-gray-100 dark:bg-gray-700">
									<tr>
										<th className={`px-3 py-3 text-left font-medium text-gray-700 dark:text-gray-300 ${isTablet ? "w-[20%]" : "w-[15%]"}`}>
											{t("owner") || "Owner"}
										</th>
										<th className={`px-3 py-3 text-left font-medium text-gray-700 dark:text-gray-300 ${isTablet ? "w-[25%]" : "w-[30%]"}`}>
											{t("zelleEmail") || "Email"}
										</th>
										<th className={`px-3 py-3 text-left font-medium text-gray-700 dark:text-gray-300 ${isTablet ? "w-[25%]" : "w-[30%]"}`}>
											{t("zelleAccountName") || "Account Name"}
										</th>
										<th className={`px-3 py-3 text-left font-medium text-gray-700 dark:text-gray-300 ${isTablet ? "w-[15%]" : "w-[10%]"}`}>
											{t("st_status")}
										</th>
										<th className={`px-3 py-3 text-left font-medium text-gray-700 dark:text-gray-300 ${isTablet ? "w-[15%]" : "w-[15%]"}`}>
											{t("actions")}
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
									{list.length === 0 ? (
										<tr>
											<td colSpan={5} className="px-4 py-8 text-center text-gray-400">
												{t("noData")}
											</td>
										</tr>
									) : (
										list.map((item) => {
											return (
												<tr key={item.id} className="hover:bg-gray-50 dark:bg-gray-900 transition-colors align-top border-t">
													<td className="p-3 overflow-hidden">
														<div className="flex flex-col gap-1.5">
															<span className="text-[12px] text-peach font-bold italic">{item.username || "-"}</span>
														</div>
													</td>
													<td className="p-3 overflow-hidden">
														<div className="flex flex-col gap-1.5">
															<span className="font-medium text-gray-900 dark:text-gray-100 truncate" title={item.comment}>
																{item.comment || "-"}
															</span>
														</div>
													</td>
													<td className="p-3 overflow-hidden">
														<div className="flex flex-col gap-1.5">
															<span className="font-medium text-gray-900 dark:text-gray-100 truncate" title={item.bankAccountHolder}>
																{item.bankAccountHolder || "-"}
															</span>
														</div>
													</td>
													<td className="p-3">
														<div className="flex flex-col gap-1 items-start">
															{(() => {
																const statusInfo = getStripeAccountStatusInfo(item.status, t);
																const colorClass =
																	{
																		gray: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100",
																		green: "bg-green-100 text-green-800",
																		blue: "bg-blue-100 text-blue-800",
																		red: "bg-red-100 text-red-800",
																	}[statusInfo.color] || "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100";
																return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${colorClass}`}>{statusInfo.label}</span>;
															})()}
														</div>
													</td>
													<td className="p-3">
														<div className="flex flex-col gap-2">
															<div className="flex flex-wrap gap-1">
																{isSuperAdmin && (
																	<button onClick={() => handleAuthorize(item)} className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors" title={t("authorize") || "Authorize"}>
																		<FontAwesomeIcon icon={faLink} />
																	</button>
																)}
																{isSuperAdmin && (
																	<button onClick={() => handleEdit(item)} className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors" title={t("edit")}>
																		<FontAwesomeIcon icon={faPen} />
																	</button>
																)}
																{isSuperAdmin && (
																	<button onClick={() => handleDelete(item)} className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors" title={t("delete")}>
																		<FontAwesomeIcon icon={faTrash} />
																	</button>
																)}
															</div>
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

			<ZelleAccountModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={loadData} initialData={editingItem} readOnly={isReadOnly} />
			
			
		</div>
	);
}
