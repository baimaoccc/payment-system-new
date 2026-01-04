import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch } from "react-redux";
import { setModal } from "../../store/slices/ui.js";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { fetchCountryGroups, deleteCountryGroup, fetchCountryGroup, createCountryGroup, fetchCountryList } from "../../controllers/countryController.js";
import { Pagination } from "../../components/common/Pagination.jsx";
import { useResponsive } from "../../hooks/useResponsive.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup, faPlus, faTrash, faEye, faSearch, faSpinner, faTimes, faCheck, faAlignLeft, faGlobeAmericas, faExclamationTriangle, faEdit } from "@fortawesome/free-solid-svg-icons";

const InputRow = ({ icon, label, children, className = "" }) => (
	<div className={`flex items-start gap-4 ${className}`}>
		<div className="text-gray-400 w-6 pt-4 flex justify-center">
			<FontAwesomeIcon icon={icon} className="text-lg" />
		</div>
		<div className="flex-1 border-b border-gray-200 focus-within:border-blue-600 transition-colors pb-2 pt-1 relative">
			<label className="block text-xs font-medium text-gray-500 mb-0.5 uppercase tracking-wider">{label}</label>
			{children}
		</div>
	</div>
);

const MultiSelect = ({ options, value, onChange, placeholder, disabled, t }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [search, setSearch] = useState("");
	const wrapperRef = useRef(null);

	useEffect(() => {
		function handleClickOutside(event) {
			if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [wrapperRef]);

	// Value is comma separated string
	const selectedValues = value
		? value
				.toString()
				.split(",")
				.map((v) => v.trim())
				.filter(Boolean)
		: [];

	const handleSelect = (code) => {
		let newValues;
		// Convert code to string for comparison to avoid type mismatch (id might be number)
		const codeStr = String(code);
		if (selectedValues.includes(codeStr)) {
			newValues = selectedValues.filter((v) => v !== codeStr);
		} else {
			newValues = [...selectedValues, codeStr];
		}
		onChange(newValues.join(","));
	};

	const removeTag = (e, code) => {
		e.stopPropagation();
		if (disabled) return;
		const newValues = selectedValues.filter((v) => v !== String(code));
		onChange(newValues.join(","));
	};

	const filteredOptions = options.filter((opt) => opt.name.toLowerCase().includes(search.toLowerCase()) || String(opt.code).toLowerCase().includes(search.toLowerCase()));

	return (
		<div className={`relative ${disabled ? "opacity-70" : ""}`} ref={wrapperRef}>
			<div className={`w-full min-h-[28px] flex flex-wrap gap-1.5 ${disabled ? "cursor-default" : "cursor-pointer"}`} onClick={() => !disabled && setIsOpen(!isOpen)}>
				{selectedValues.length === 0 && <span className="text-gray-300 py-1 text-sm">{placeholder}</span>}
				{selectedValues.map((code) => {
					const country = options.find((o) => String(o.code) === code);
					return (
						<span key={code} className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded text-xs flex items-center gap-1">
							<span className="font-medium">{code}</span>
							{country && <span className="text-blue-400 w-auto truncate hidden sm:inline">{country.name}</span>}
							{!disabled && (
								<button type="button" onClick={(e) => removeTag(e, code)} className="ml-0.5 hover:text-blue-900 focus:outline-none">
									<FontAwesomeIcon icon={faTimes} className="text-[10px]" />
								</button>
							)}
						</span>
					);
				})}
			</div>

			{isOpen && !disabled && (
				<div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 flex flex-col animate-in fade-in zoom-in-95 duration-100">
					<div className="p-2 border-b border-gray-100 bg-gray-50/50">
						<div className="relative">
							<FontAwesomeIcon icon={faSearch} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
							<input type="text" value={search} onClick={(e) => e.stopPropagation()} onChange={(e) => setSearch(e.target.value)} placeholder={t("searchCountries")} className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" autoFocus />
						</div>
					</div>
					<div className="overflow-y-auto flex-1 p-1">
						{filteredOptions.length === 0 ? (
							<div className="p-3 text-xs text-gray-400 text-center">{t("noData")}</div>
						) : (
							filteredOptions.map((opt, index) => {
								const isSelected = selectedValues.includes(String(opt.code));
								return (
									<div key={opt.code} onClick={() => handleSelect(opt.code)} className={`px-3 py-2 text-xs rounded-md cursor-pointer flex items-center justify-between transition-colors ${isSelected ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}>
										<div className="flex items-center gap-2">
											<span className="w-8 font-mono text-gray-500 text-[20px]">{opt.flag}</span>
											{/* <img src={opt.flag} alt={opt.name} className="h-4 rounded-full" /> */}
											<span>{opt.name}</span>
										</div>
										{isSelected && <FontAwesomeIcon icon={faCheck} className="text-blue-600" />}
									</div>
								);
							})
						)}
					</div>
				</div>
			)}
		</div>
	);
};

const MobileWhitelistGroupCard = ({ group, onEdit, onDelete, onView, t, lang }) => {
	const [expanded, setExpanded] = useState(false);
	const hasManyItems = group.fz_json && Array.isArray(group.fz_json) && group.fz_json.length > 12;

	return (
		<div className={`bg-white rounded-xl p-4 shadow-sm border transition-all duration-200 cursor-pointer ${expanded ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-100 hover:shadow-md"}`} onClick={() => setExpanded(!expanded)}>
			<div className="flex justify-between items-start mb-3">
				<div className="flex-1 min-w-0 mr-3">
					<div className="flex items-center gap-2 mb-1">
						<span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs font-mono shrink-0">#{group.id}</span>
						<h3 className="font-bold text-gray-900 line-clamp-1 break-all">{group.name}</h3>
					</div>
				</div>
				<div className="flex gap-2 shrink-0">
					<button
						onClick={(e) => {
							e.stopPropagation();
							onEdit(group);
						}}
						className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
						title={t("edit")}>
						<FontAwesomeIcon icon={faEdit} size="sm" />
					</button>
					<button
						onClick={(e) => {
							e.stopPropagation();
							onDelete(group);
						}}
						className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
						title={t("delete")}>
						<FontAwesomeIcon icon={faTrash} size="sm" />
					</button>
				</div>
			</div>

			<div className="space-y-2">
				<div>
					<span className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">{t("st_whitelist")}</span>
					<div className={`flex flex-wrap gap-1.5 transition-all duration-300 ease-in-out ${expanded ? "" : "max-h-[60px] overflow-hidden"}`}>
						{group.fz_json && Array.isArray(group.fz_json) && group.fz_json.length > 0 ? (
							group.fz_json.map((country) => (
								<span key={country.id} className="inline-flex items-center px-2 py-1 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100" title={lang === "zh" ? country.name_cn : country.name_en}>
									<span className="mr-1">{country.flag}</span>
									{country.alpha2}
								</span>
							))
						) : (
							<span className="text-xs text-gray-400 italic">{t("noData")}</span>
						)}
					</div>
					{!expanded && hasManyItems && (
						<div className="flex justify-center mt-1">
							<span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{t("clickToExpand") || "..."}</span>
						</div>
					)}
				</div>

				<div className="pt-3 mt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
					<span>{t("createTime")}</span>
					<span className="font-mono">{group.createtime ? new Date(group.createtime * 1000).toLocaleString() : "-"}</span>
				</div>
			</div>
		</div>
	);
};

export default function StripeWhitelistGroupsView() {
	const { t, lang } = useI18n();
	const dispatch = useDispatch();
	const { isMobile } = useResponsive();

	const [loading, setLoading] = useState(true);
	const [groups, setGroups] = useState([]);
	const [pagination, setPagination] = useState({ page: 1, per_page: 20, total: 0 });
	const [searchName, setSearchName] = useState("");

	// View Modal State
	const [viewModalOpen, setViewModalOpen] = useState(false);
	const [viewData, setViewData] = useState(null);
	const [viewLoading, setViewLoading] = useState(false);

	// Create Modal State
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [createData, setCreateData] = useState({ name: "", selectedCountries: "" }); // Changed selectedCountries to string for MultiSelect
	const [allCountries, setAllCountries] = useState([]);
	const [mappedCountries, setMappedCountries] = useState([]); // For MultiSelect options
	const [countriesLoading, setCountriesLoading] = useState(false);
	const [createSubmitting, setCreateSubmitting] = useState(false);

	// Delete Modal State
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [groupToDelete, setGroupToDelete] = useState(null);
	const [deleteLoading, setDeleteLoading] = useState(false);

	useEffect(() => {
		loadGroups();
		loadAllCountries(); // Pre-load countries
	}, [pagination.page]);

	// Map countries for MultiSelect whenever allCountries changes
	useEffect(() => {
		if (allCountries.length > 0) {
			const mapped = allCountries.map((c) => ({
				code: c.alpha2 || String(c.id), // Use alpha2 (e.g. US) if available, fallback to ID
				name: lang === "zh" ? c.name_cn || c.name : c.name_en || c.name, // Dynamic name based on lang
				flag: c.flag,
			}));
			setMappedCountries(mapped);
		}
	}, [allCountries, lang]);

	const loadAllCountries = async () => {
		if (allCountries.length > 0) return;
		setCountriesLoading(true);
		const res = await fetchCountryList();
		if (res.ok && Array.isArray(res.data)) {
			setAllCountries(res.data);
		} else {
			console.error("Failed to load countries", res);
			dispatch({ type: "ui/addToast", payload: { type: "error", message: t("loadFailed") } });
		}
		setCountriesLoading(false);
	};

	const handleOpenCreate = () => {
		setEditingId(null);
		setCreateData({ name: "", selectedCountries: "" });
		setCreateModalOpen(true);
	};

	const handleEdit = (group) => {
		setEditingId(group.id);
		// Convert fz_json (array of country objects) back to comma-separated codes for MultiSelect
		const codes = group.fz_json && Array.isArray(group.fz_json) ? group.fz_json.map((c) => c.alpha2 || String(c.id)).join(",") : "";

		setCreateData({
			name: group.name,
			selectedCountries: codes,
		});
		setCreateModalOpen(true);
	};

	const handleCreateSubmit = async () => {
		if (!createData.name.trim()) {
			dispatch({ type: "ui/addToast", payload: { type: "warning", message: t("pleaseEnterName") } });
			return;
		}
		if (!createData.selectedCountries) {
			dispatch({ type: "ui/addToast", payload: { type: "warning", message: t("pleaseSelectCountries") } });
			return;
		}

		setCreateSubmitting(true);

		// Prepare payload
		// Parse the comma-separated string of codes (alpha2 or id)
		const selectedCodes = createData.selectedCountries
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);

		// Filter allCountries to get the full objects for selected codes
		const selectedObjects = allCountries.filter((c) => {
			const code = c.alpha2 || String(c.id);
			return selectedCodes.includes(code);
		});

		const payload = {
			name: createData.name,
			user_id: 1, // Hardcoded as per user example
			fz_json: selectedObjects,
		};

		if (editingId) {
			payload.id = editingId;
		}

		const res = await createCountryGroup(payload);

		if (res.ok) {
			dispatch({ type: "ui/addToast", payload: { type: "success", message: editingId ? t("updateSuccess") : t("createSuccess") } });
			setCreateModalOpen(false);
			loadGroups(); // Refresh list
		} else {
			dispatch({ type: "ui/addToast", payload: { type: "error", message: res.error?.message || (editingId ? t("updateFailed") : t("createFailed")) } });
		}
		setCreateSubmitting(false);
	};

	const loadGroups = async () => {
		setLoading(true);
		const res = await fetchCountryGroups({
			page: pagination.page,
			per_page: pagination.per_page,
			name: searchName || null,
		});

		if (res.ok) {
			setGroups(res.data.list || []);
			setPagination((prev) => ({ ...prev, total: res.data.total || 0 }));
		} else {
			dispatch({ type: "ui/addToast", payload: { type: "error", message: res.error?.message || t("loadFailed") } });
		}
		setLoading(false);
	};

	const handleSearch = (e) => {
		e.preventDefault();
		setPagination((prev) => ({ ...prev, page: 1 }));
		loadGroups();
	};

	const handleDelete = (group) => {
		dispatch(
			setModal({
				title: t("deleteGroup"),
				message: t("deleteGroupConfirm").replace("{name}", group.name),
				variant: "danger",
				showCancel: true,
				confirmText: t("delete"),
				cancelText: t("cancel"),
				onConfirm: () => handleDeleteConfirm(group),
			})
		);
	};

	const handleDeleteConfirm = async (group) => {
		const res = await deleteCountryGroup(group.id);
		if (res.ok) {
			dispatch({ type: "ui/addToast", payload: { type: "success", message: t("deleteSuccess") } });
			loadGroups();
		} else {
			dispatch({ type: "ui/addToast", payload: { type: "error", message: res.error?.message || t("deleteFailed") } });
		}
	};

	const handleView = async (id) => {
		setViewModalOpen(true);
		setViewLoading(true);
		setViewData(null);

		const res = await fetchCountryGroup(id);
		if (res.ok) {
			setViewData(res.data);
		} else {
			dispatch({ type: "ui/addToast", payload: { type: "error", message: res.error?.message || t("loadFailed") } });
			setViewModalOpen(false);
		}
		setViewLoading(false);
	};

	return (
		<div className="p-6">
			{/* Header & Search */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
				<div>
					<h1 className="text-xl font-bold text-gray-900">{t("whitelistGroupsTitle")}</h1>
					<p className="text-gray-500 text-sm mt-0.5">{t("whitelistGroupsSub")}</p>
				</div>
				<div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
					<form onSubmit={handleSearch} className="relative flex-1 sm:flex-initial sm:w-64">
						<input type="text" value={searchName} onChange={(e) => setSearchName(e.target.value)} placeholder={t("searchGroupPlaceholder")} className="w-full pl-4 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
						<button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 p-1.5 transition-colors">
							<FontAwesomeIcon icon={faSearch} />
						</button>
					</form>
					<button onClick={handleOpenCreate} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap">
						<FontAwesomeIcon icon={faPlus} />
						<span>{t("createGroup")}</span>
					</button>
				</div>
			</div>

			{/* Table */}
			{loading ? (
				<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-4 p-12 text-center text-gray-500 flex flex-col items-center gap-3">
					<FontAwesomeIcon icon={faSpinner} spin className="text-2xl" />
					<p>{t("loading")}</p>
				</div>
			) : groups.length === 0 ? (
				<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-4 p-12 text-center text-gray-500 flex flex-col items-center gap-3">
					<div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
						<FontAwesomeIcon icon={faLayerGroup} className="text-gray-400 text-2xl" />
					</div>
					<p>{t("noData")}</p>
				</div>
			) : isMobile ? (
				<div className="mt-4 space-y-3">
					{groups.map((group) => (
						<MobileWhitelistGroupCard key={group.id} group={group} onEdit={handleEdit} onDelete={handleDelete} onView={handleView} t={t} lang={lang} />
					))}
					<div className="pt-2">
						<Pagination page={pagination.page} pageSize={pagination.per_page} total={pagination.total} onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))} onPageSizeChange={(size) => setPagination((prev) => ({ ...prev, per_page: size, page: 1 }))} />
					</div>
				</div>
			) : (
				<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-4">
					<div className="overflow-x-auto">
						<table className="w-full text-sm text-left">
							<thead className="bg-gray-50 text-gray-500 font-medium">
								<tr>
									<th className="px-6 py-2">{t("idLabel")}</th>
									<th className="px-6 py-2">{t("name")}</th>
									<th className="px-6 py-2 w-1/2">{t("st_whitelist")}</th>
									<th className="px-6 py-2">{t("crt")}</th>
									<th className="px-6 py-2 text-right">{t("actions")}</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{groups.map((group) => (
									<tr key={group.id} className="hover:bg-gray-50 transition-colors text-[12px]">
										<td className="px-6 py-2 font-mono text-gray-500">#{group.id}</td>
										<td className="px-6 py-2 font-medium text-gray-900">
											<div className="line-clamp-3" title={group.name}>
												{group.name}
											</div>
										</td>
										<td className="px-6 py-2">
											<div className="line-clamp-3 leading-6">
												{group.fz_json && Array.isArray(group.fz_json) && group.fz_json.length > 0 ? (
													group.fz_json.map((country) => (
														<span key={country.id} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded text-xs mr-1.5 mb-1" title={lang === "zh" ? country.name_cn : country.name_en}>
															<span>{country.flag}</span>
															<span className="font-medium">{country.alpha2}</span>
														</span>
													))
												) : (
													<span className="text-gray-400 italic text-xs">{t("noData")}</span>
												)}
											</div>
										</td>
										<td className="px-6 py-2 text-gray-500">{group.createtime ? new Date(group.createtime * 1000).toLocaleString() : "-"}</td>
										<td className="px-6 py-2 text-right">
											<div className="flex items-center justify-end gap-2">
												<button onClick={() => handleView(group.id)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title={t("details")}>
													<FontAwesomeIcon icon={faEye} />
												</button>
												<button onClick={() => handleEdit(group)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title={t("edit")}>
													<FontAwesomeIcon icon={faEdit} />
												</button>
												<button onClick={() => handleDelete(group)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title={t("delete")}>
													<FontAwesomeIcon icon={faTrash} />
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Pagination */}
					<Pagination page={pagination.page} pageSize={pagination.per_page} total={pagination.total} onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))} onPageSizeChange={(size) => setPagination((prev) => ({ ...prev, per_page: size, page: 1 }))} />
				</div>
			)}

			{/* View Modal */}
			{viewModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
					<div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
						<div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
							<h3 className="font-bold text-gray-900">{t("details")}</h3>
							<button onClick={() => setViewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
								<FontAwesomeIcon icon={faPlus} className="rotate-45" />
							</button>
						</div>
						<div className="p-6 max-h-[60vh] overflow-y-auto">
							{viewLoading ? (
								<div className="py-8 text-center text-gray-500">
									<FontAwesomeIcon icon={faSpinner} spin className="mb-2" />
									<p>{t("loading")}</p>
								</div>
							) : viewData ? (
								<div className="space-y-4">
									<div>
										<label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">{t("name")}</label>
										<div className="text-gray-900 font-medium">{viewData.name}</div>
									</div>
									<div>
										<label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">{t("st_whitelist")}</label>
										<div className="flex flex-wrap gap-1.5 mt-2">
											{viewData.fz_json && Array.isArray(viewData.fz_json) && viewData.fz_json.length > 0 ? (
												viewData.fz_json.map((country) => (
													<span key={country.id} className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
														<span>{country.flag}</span>
														<span>{country.alpha2}</span>
														<span className="text-blue-400 border-l border-blue-200 pl-1 ml-0.5">{lang === "zh" ? country.name_cn : country.name_en}</span>
													</span>
												))
											) : viewData.country_codes && viewData.country_codes.length > 0 ? (
												viewData.country_codes.map((code) => (
													<span key={code} className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded text-xs font-medium">
														{code}
													</span>
												))
											) : (
												<span className="text-gray-400 italic text-sm">{t("noData")}</span>
											)}
										</div>
									</div>
									{viewData.createtime && (
										<div>
											<label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">{t("crt")}</label>
											<div className="text-gray-600 text-sm">{new Date(viewData.createtime * 1000).toLocaleString()}</div>
										</div>
									)}
								</div>
							) : (
								<div className="text-center text-gray-500">{t("noData")}</div>
							)}
						</div>
						<div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
							<button onClick={() => setViewModalOpen(false)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
								{t("close")}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Create Modal */}
			{createModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
					<div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
						{/* Header */}
						<div className="px-8 py-6 border-b border-gray-100 bg-white">
							<div className="flex justify-between items-start">
								<div>
									<h3 className="text-xl font-bold text-gray-900">{editingId ? t("editGroup") : t("createGroup")}</h3>
									{/* <p className="text-sm text-gray-500 mt-1">{t("createGroupSub") || "Create a new country whitelist group"}</p> */}
									{/* Info Box */}
									<div className="mt-2 p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-700 flex gap-3 items-start">
										<FontAwesomeIcon icon={faLayerGroup} className="mt-0.5" />
										<div>
											<p className="font-medium">About Whitelist Groups</p>
											<p className="opacity-90 mt-1">Whitelist groups allow you to define sets of countries that are approved for transactions. These groups can be assigned to multiple Stripe accounts to manage risk effectively.</p>
										</div>
									</div>
								</div>
								<button onClick={() => setCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-50">
									<FontAwesomeIcon icon={faTimes} className="text-xl" />
								</button>
							</div>
						</div>

						{/* Body */}
						<div className="flex-1 overflow-y-auto custom-scrollbar">
							<div className="p-6">
								<InputRow icon={faLayerGroup} label={t("name")}>
									<input type="text" value={createData.name} onChange={(e) => setCreateData((prev) => ({ ...prev, name: e.target.value }))} className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-300 py-1" placeholder={t("enterGroupName")} />
								</InputRow>

								<InputRow icon={faGlobeAmericas} label={t("selectCountries")} className="min-h-[200px] mt-4">
									<MultiSelect options={mappedCountries} value={createData.selectedCountries} onChange={(val) => setCreateData((prev) => ({ ...prev, selectedCountries: val }))} placeholder={t("searchCountries")} disabled={countriesLoading} t={t} />
									{countriesLoading && (
										<div className="text-xs text-blue-500 mt-1">
											<FontAwesomeIcon icon={faSpinner} spin /> {t("loading")}
										</div>
									)}
								</InputRow>
							</div>
						</div>

						{/* Footer */}
						<div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
							<button onClick={() => setCreateModalOpen(false)} className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm">
								{t("cancel")}
							</button>
							<button onClick={handleCreateSubmit} disabled={createSubmitting} className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none flex items-center gap-2">
								{createSubmitting && <FontAwesomeIcon icon={faSpinner} spin />}
								{editingId ? t("save") : t("createGroup")}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
