import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { addToast, setModal } from "../../store/slices/ui.js";
import { fetchWebsiteList, createOrUpdateWebsite, deleteWebsite, uploadWebsiteExcel, batchUpdateWebsiteStatus } from "../../controllers/websiteController.js";
import { fetchUserListNII } from "../../controllers/usersController.js";
import { Pagination } from "../../components/common/Pagination.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faPen, faTrash, faSpinner, faAlignLeft, faLink, faGlobe, faServer, faUser, faToggleOn, faTimes, faCheckCircle, faTimesCircle, faDownload, faUpload } from "@fortawesome/free-solid-svg-icons";
import { Select } from "../../components/ui/Select.jsx";
import { API_BASE_URL, API_WEBSITE_EXPORT_TEMPLATE } from "../../constants/api.js";

const MobileWebsiteCard = ({ item, onEdit, onDelete, t, isBatchMode, isSelected, onToggle, isAdmin }) => {
	const [expanded, setExpanded] = useState(false);
	const canAction = isAdmin || item.status == 0;

	return (
		<div className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 transition-all duration-200 cursor-pointer ${expanded ? "ring-1 ring-blue-100" : "hover:shadow-md"} ${isSelected ? "ring-2 ring-blue-500 bg-blue-50/30" : ""}`} onClick={() => (isBatchMode ? onToggle(item.id) : setExpanded(!expanded))}>
			<div className="flex justify-between items-start mb-3">
				{isBatchMode && (
					<div className="mr-3 pt-1">
						<input type="checkbox" checked={isSelected} readOnly className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 pointer-events-none" />
					</div>
				)}
				<div className="flex-1 min-w-0 mr-3">
					<div className="flex items-center gap-2 mb-1">
						<span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs font-mono shrink-0">#{item.id}</span>
						<h3 className="font-bold text-gray-900 line-clamp-1 break-all">{item.domain_name}</h3>
					</div>
					<div className="flex items-center gap-2 mb-1">
						<div className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block">{item.website_system}</div>
						{item.username && <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block">{item.username}</div>}
					</div>
					<div className="text-xs text-gray-500 break-all">{item.url}</div>
				</div>
				{canAction && (
					<div className="flex gap-2 shrink-0">
						<button
							onClick={(e) => {
								e.stopPropagation();
								onEdit(item);
							}}
							className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
							title={t("edit")}>
							<FontAwesomeIcon icon={faPen} size="sm" />
						</button>
						<button
							onClick={(e) => {
								e.stopPropagation();
								onDelete(item.id, item.domain_name);
							}}
							className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
							title={t("delete")}>
							<FontAwesomeIcon icon={faTrash} size="sm" />
						</button>
					</div>
				)}
			</div>

			<div className="pt-3 mt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
				<span className={`flex items-center gap-1 ${item.status == 1 ? "text-green-500" : item.status == 2 ? "text-orange-500" : "text-gray-400"}`}>
					<FontAwesomeIcon icon={item.status == 1 ? faCheckCircle : item.status == 2 ? faSpinner : faTimesCircle} />
					{item.status == 1 ? t("active") : item.status == 2 ? t("pendingReview") || "Pending" : t("inactive")}
				</span>
				<span className="font-mono">{item.createtime ? new Date(item.createtime * 1000).toLocaleString() : "-"}</span>
			</div>
		</div>
	);
};

const DesktopWebsiteRow = ({ item, onEdit, onDelete, t, isBatchMode, isSelected, onToggle, isAdmin }) => {
	const canAction = isAdmin || item.status == 0;
	return (
		<tr className={`hover:bg-gray-50/50 transition-colors ${isSelected ? "bg-blue-50/30" : ""}`} onClick={() => isBatchMode && onToggle(item.id)}>
			{isBatchMode && (
				<td className="py-2 px-6 w-10" onClick={(e) => e.stopPropagation()}>
					<input type="checkbox" checked={isSelected} onChange={() => onToggle(item.id)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
				</td>
			)}
			<td className="py-2 px-6 text-xs font-medium text-gray-900">{item.domain_name}</td>
			<td className="py-2 px-6 text-xs text-blue-500 underline decoration-blue-200 underline-offset-2">
				<a
					href={item.url}
					target="_blank"
					rel="noopener noreferrer"
					onClick={(e) => {
						if (isBatchMode) e.stopPropagation();
					}}>
					{item.url}
				</a>
			</td>
			<td className="py-2 px-6 text-xs text-gray-600">
				<span className="bg-gray-100 px-2 py-0.5 rounded-full">{item.website_system || "-"}</span>
			</td>
			<td className="py-2 px-6 text-xs text-gray-600">{item.username || "-"}</td>
			<td className="py-2 px-6 text-xs">
				<span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${item.status == 1 ? "bg-green-50 text-green-700" : item.status == 2 ? "bg-orange-50 text-orange-700" : "bg-gray-100 text-gray-600"}`}>
					<span className={`w-1.5 h-1.5 rounded-full ${item.status == 1 ? "bg-green-500" : item.status == 2 ? "bg-orange-500" : "bg-gray-400"}`}></span>
					{item.status == 1 ? t("active") : item.status == 2 ? t("pendingReview") || "Pending" : t("inactive")}
				</span>
			</td>
			<td className="py-2 px-6 text-xs text-gray-500">{item.createtime ? new Date(item.createtime * 1000).toLocaleString() : "-"}</td>
			<td className="py-2 px-6 text-right">
				{canAction && (
					<div className="flex items-center justify-end gap-2">
						<button onClick={() => onEdit(item)} className="text-xs p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title={t("edit")}>
							<FontAwesomeIcon icon={faPen} />
						</button>
						<button onClick={() => onDelete(item.id, item.domain_name)} className="text-xs p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title={t("delete")}>
							<FontAwesomeIcon icon={faTrash} />
						</button>
					</div>
				)}
			</td>
		</tr>
	);
};

const InputRow = ({ icon, label, children, className = "", noBorder = false }) => (
	<div className={`flex items-start gap-4 ${className}`}>
		<div className="text-gray-400 w-6 pt-4 flex justify-center">
			<FontAwesomeIcon icon={icon} className="text-lg" />
		</div>
		<div className={`flex-1 ${noBorder ? "" : "border-b border-gray-200 focus-within:border-blue-600"} transition-colors pb-2 pt-1 relative`}>
			<label className="block text-xs font-medium text-gray-500 mb-0.5 uppercase tracking-wider">{label}</label>
			{children}
		</div>
	</div>
);

function WebsiteFormModal({ open, initial, onClose, onSave, t }) {
	const dispatch = useDispatch();
	const user = useSelector((s) => s.auth.user);
	const isSuperAdmin = user?.juese_id === 1;
	const isAdmin = user?.juese_id === 4;
	const isAdvertiser = user?.juese_id === 6; // Assuming advertiser role ID is 6, adjust if needed based on context or check

	const [form, setForm] = useState({
		user_id: "",
		domain_name: "",
		url: "",
		status: "1",
		website_system: "wordpress",
	});
	const [saving, setSaving] = useState(false);
	const [adminUsers, setAdminUsers] = useState([]);

	useEffect(() => {
		if (open && isSuperAdmin && adminUsers.length === 0) {
			fetchUserListNII().then((res) => {
				if (res.ok) {
					setAdminUsers(res.data || []);
				}
			});
		}
	}, [open, isSuperAdmin, adminUsers.length]);

	useEffect(() => {
		if (initial) {
			setForm({
				id: initial.id,
				user_id: initial.user_id || "",
				domain_name: initial.domain_name || "",
				url: initial.url || "",
				status: initial.status?.toString() || "1",
				website_system: initial.website_system || "wordpress",
			});
		} else {
			setForm({
				user_id: "",
				domain_name: "",
				url: "",
				status: isAdvertiser ? "2" : "1", // Advertiser defaults to 2 (Pending Review)
				website_system: "wordpress",
			});
		}
	}, [initial, open, isAdvertiser]);

	useEffect(() => {
		if (initial) return;

		// Simple heuristic to detect system from URL
		const url = form.url.toLowerCase();
		if (url.includes("wordpress") || url.includes("wp-")) {
			setForm((v) => ({ ...v, website_system: "wordpress" }));
		} else if (url.includes("shopify") || url.includes("myshopify")) {
			setForm((v) => ({ ...v, website_system: "shopify" }));
		} else if (url.includes("magento")) {
			setForm((v) => ({ ...v, website_system: "magento" }));
		} else if (url.includes("opencart")) {
			setForm((v) => ({ ...v, website_system: "opencart" }));
		}
	}, [form.url, initial]);

	const handleSubmit = async () => {
		if (!form.domain_name) return dispatch(addToast({ id: Date.now(), type: "error", message: t("isRequired") }));
		if (!form.url) return dispatch(addToast({ id: Date.now(), type: "error", message: t("isRequired") }));

		setSaving(true);

		const res = await createOrUpdateWebsite(form);

		setSaving(false);

		if (res.ok) {
			dispatch(addToast({ id: Date.now(), type: "success", message: t("saveSuccess") }));
			onSave();
			onClose();
		} else {
			dispatch(addToast({ id: Date.now(), type: "error", message: res.error?.message || t("saveFailed") }));
		}
	};

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
			<div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300 mx-2">
				<div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
					<h3 className="text-lg font-bold text-gray-900">{initial ? t("editWebsite") : t("addWebsite")}</h3>
					<button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
						<FontAwesomeIcon icon={faTimes} />
					</button>
				</div>

				<div className="p-6 space-y-6">
					{isSuperAdmin && (
						<InputRow icon={faUser} label={t("userId")} noBorder={true}>
							<Select value={form.user_id} onChange={(val) => setForm((v) => ({ ...v, user_id: val }))} options={[{ value: "", label: `${user?.username || "Me"} (${t("currentUser") || "Current"})` }, ...adminUsers.map((u) => ({ value: u.id, label: u.username }))]} placeholder={t("selectUser") || "Select User"} className="w-full" />
						</InputRow>
					)}
					<InputRow icon={faGlobe} label={t("domainName")}>
						<input type="text" value={form.domain_name} onChange={(e) => setForm((v) => ({ ...v, domain_name: e.target.value }))} placeholder={t("domainPlaceholder")} className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-300 py-1" autoFocus />
					</InputRow>
					<InputRow icon={faLink} label={t("websiteUrl")}>
						<input type="text" value={form.url} onChange={(e) => setForm((v) => ({ ...v, url: e.target.value }))} placeholder={t("urlPlaceholder")} className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-300 py-1" />
					</InputRow>
					<InputRow icon={faServer} label={t("websiteSystem")} noBorder={true}>
						<Select
							value={form.website_system}
							onChange={(val) => setForm((v) => ({ ...v, website_system: val }))}
							options={[
								{ value: "wordpress", label: t("system_wordpress") },
								{ value: "shopify", label: t("system_shopify") },
								{ value: "magento", label: t("system_magento") },
								{ value: "opencart", label: t("system_opencart") },
								{ value: "other", label: t("system_other") },
							]}
							className="w-full"
						/>
					</InputRow>
					<InputRow icon={faToggleOn} label={t("status")} noBorder={true}>
						{isAdvertiser ? (
							<div className="flex items-center h-full px-3 text-sm text-gray-600 bg-gray-50 rounded-lg border border-gray-100">{form.status == "1" ? t("active") : form.status == "0" ? t("inactive") : t("pendingReview") || "Pending Review"}</div>
						) : (
							<Select
								value={form.status}
								onChange={(val) => setForm((v) => ({ ...v, status: val }))}
								options={[
									{ value: "1", label: t("active") },
									{ value: "0", label: t("inactive") },
									{ value: "2", label: t("pendingReview") || "Pending Review" },
								]}
								className="w-full"
							/>
						)}
					</InputRow>
				</div>

				<div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
					<button onClick={onClose} className="px-6 py-2 rounded-xl text-gray-600 font-medium hover:bg-gray-200 transition-colors" disabled={saving}>
						{t("cancel")}
					</button>
					<button onClick={handleSubmit} disabled={saving} className="px-6 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2">
						{saving && <FontAwesomeIcon icon={faSpinner} spin />}
						{t("save")}
					</button>
				</div>
			</div>
		</div>
	);
}

export function WebsiteView() {
	const { t } = useI18n();
	const dispatch = useDispatch();
	const user = useSelector((s) => s.auth.user);
	const token = useSelector((s) => s.auth.token);
	const isSuperAdminOrAdmin = user?.juese_id === 1 || user?.juese_id === 4;
	const isAdvertiser = user?.juese_id === 6;

	const [list, setList] = useState([]);
	const [loading, setLoading] = useState(false);
	const [pagination, setPagination] = useState({ page: 1, per_page: 20, total: 0 });
	const [modalOpen, setModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState(null);
	const [isExporting, setIsExporting] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const uploadInputRef = React.useRef(null);

	// Batch Audit State
	const [isBatchMode, setIsBatchMode] = useState(false);
	const [selectedIds, setSelectedIds] = useState([]);
	const [batchProcessing, setBatchProcessing] = useState(false);
	const [filterStatus, setFilterStatus] = useState("");

	const loadData = async (page = 1) => {
		setLoading(true);
		const res = await fetchWebsiteList({ page, per_page: pagination.per_page, status: filterStatus });
		setLoading(false);

		if (res.ok) {
			console.log('~~~~~~~~~~~~~')
			console.log(res.data);
			setList(res.data.list);
			setPagination((p) => ({ ...p, page, total: res.data.total }));
			// Clear selection on page change or reload if needed, or keep it?
			// Usually safer to clear to avoid actions on invisible items
			setSelectedIds([]);
		} else {
			dispatch(addToast({ id: Date.now(), type: "error", message: res.error?.message || t("loadFailed") }));
		}
	};

	useEffect(() => {
		loadData();
	}, [filterStatus]); // Reload when filter changes

	// Batch Handlers
	const toggleBatchMode = () => {
		setIsBatchMode(!isBatchMode);
		setSelectedIds([]);
	};

	const toggleSelection = (id) => {
		setSelectedIds((prev) => {
			if (prev.includes(id)) {
				return prev.filter((i) => i !== id);
			} else {
				return [...prev, id];
			}
		});
	};

	const handleSelectAll = () => {
		if (selectedIds.length === list.length) {
			setSelectedIds([]);
		} else {
			setSelectedIds(list.map((item) => item.id));
		}
	};

	const handleBatchAction = async (status) => {
		if (selectedIds.length === 0) {
			return dispatch(addToast({ id: Date.now(), type: "warning", message: t("pleaseSelectItems") || "Please select items" }));
		}

		setBatchProcessing(true);

		const res = await batchUpdateWebsiteStatus(selectedIds, status);

		setBatchProcessing(false);

		if (res.ok) {
			dispatch(
				addToast({
					id: Date.now(),
					type: "success",
					message: t("operationSuccess") || "Operation Success",
				}),
			);
			loadData(pagination.page);
			setIsBatchMode(false);
			setSelectedIds([]);
		} else {
			dispatch(
				addToast({
					id: Date.now(),
					type: "error",
					message: res.error?.message || t("operationFailed") || "Operation Failed",
				}),
			);
		}
	};

	const handleDownloadTemplate = () => {
		if (isExporting) return;
		setIsExporting(true);

		try {
			const params = new URLSearchParams();
			if (token) {
				params.append("token", token);
			}
			const url = `${API_BASE_URL}${API_WEBSITE_EXPORT_TEMPLATE}?${params.toString()}`;
			window.open(url, "_blank");
		} catch (e) {
			console.error("Export error:", e);
			dispatch(addToast({ id: Date.now(), type: "error", message: t("exportFailed") || "Export Failed" }));
		} finally {
			setTimeout(() => setIsExporting(false), 1000);
		}
	};

	const handleUploadTemplate = (e) => {
		const file = e.target.files && e.target.files[0];
		if (!file) return;
		if (isUploading) return;
		setIsUploading(true);

		const reader = new FileReader();
		reader.onload = async () => {
			try {
				const result = reader.result;
				if (typeof result !== "string") {
					throw new Error("Invalid file result");
				}
				const base64 = result.split(",")[1] || result;

				const res = await uploadWebsiteExcel({ filename: file.name, filetype: file.type, filedata: base64 });
				if (!res.ok) throw new Error(res.error?.message || "Upload failed");

				dispatch(addToast({ id: Date.now(), type: "success", message: t("uploadSuccess") || "Upload Success" }));
				loadData(pagination.page);
			} catch (error) {
				console.error("Upload error", error);
				dispatch(addToast({ id: Date.now(), type: "error", message: error.message || t("uploadFailed") || "Upload Failed" }));
			} finally {
				setIsUploading(false);
				if (uploadInputRef.current) uploadInputRef.current.value = "";
			}
		};
		reader.readAsDataURL(file);
	};

	const handleEdit = (item) => {
		setEditingItem(item);
		setModalOpen(true);
	};

	const handleDelete = (id, name) => {
		dispatch(
			setModal({
				isOpen: true,
				title: t("delete"),
				message: t("deleteWebsiteConfirm", { name }),
				onConfirm: async () => {
					const res = await deleteWebsite(id);
					if (res.ok) {
						dispatch(addToast({ id: Date.now(), type: "success", message: t("deleteSuccess") }));
						loadData(pagination.page);
					} else {
						dispatch(addToast({ id: Date.now(), type: "error", message: res.error?.message || t("deleteFailed") }));
					}
				},
			}),
		);
	};

	const handleSave = () => {
		loadData(pagination.page);
	};

	return (
		<div className="p-4 md:p-8 mx-auto">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">{t("websiteManagement")}</h1>
				</div>
				<div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
					{isBatchMode ? (
						<div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-5 duration-200">
							<label className="flex items-center gap-2 mr-2 cursor-pointer md:hidden bg-gray-100 px-3 py-1 rounded-lg">
								<input type="checkbox" checked={list.length > 0 && selectedIds.length === list.length} onChange={handleSelectAll} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
								<span className="text-sm font-medium text-gray-600">{t("all") || "All"}</span>
							</label>
							<span className="text-sm text-gray-500 mr-2 font-medium bg-gray-100 px-3 py-1 rounded-lg">
								{t("selected")}: {selectedIds.length}
							</span>
							<button onClick={() => handleBatchAction(1)} disabled={batchProcessing || selectedIds.length === 0} className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all text-xs shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
								{batchProcessing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faCheckCircle} />}
								<span>{t("batchApprove")}</span>
							</button>
							<button onClick={() => handleBatchAction(0)} disabled={batchProcessing || selectedIds.length === 0} className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all text-xs shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
								{batchProcessing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faTimesCircle} />}
								<span>{t("batchReject")}</span>
							</button>
							<button onClick={toggleBatchMode} disabled={batchProcessing} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-all text-xs">
								{t("cancelBatch")}
							</button>
						</div>
					) : (
						<>
							<div className="w-full md:w-36">
								<Select
									value={filterStatus}
									onChange={(val) => setFilterStatus(val)}
									options={[
										{ value: "", label: t("all") },
										{ value: "1", label: t("active") },
										{ value: "0", label: t("inactive") },
										{ value: "2", label: t("pendingReview") },
									]}
									placeholder={t("status")}
									className="w-full text-xs"
								/>
							</div>

							{isSuperAdminOrAdmin && (
								<button onClick={toggleBatchMode} className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all text-xs shadow-sm">
									<FontAwesomeIcon icon={faCheckCircle} className="text-blue-500" />
									<span>{t("batchAudit")}</span>
								</button>
							)}

							<button onClick={handleDownloadTemplate} disabled={isExporting} className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all text-xs shadow-sm">
								<FontAwesomeIcon icon={isExporting ? faSpinner : faDownload} spin={isExporting} />
								<span>{t("downloadTemplate") || "Download Template"}</span>
							</button>

							<div className="relative">
								<input type="file" ref={uploadInputRef} onChange={handleUploadTemplate} accept=".xls,.xlsx" className="hidden" />
								<button onClick={() => uploadInputRef.current?.click()} disabled={isUploading} className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all text-xs shadow-sm">
									<FontAwesomeIcon icon={isUploading ? faSpinner : faUpload} spin={isUploading} />
									<span>{t("batchUpload") || "Batch Upload"}</span>
								</button>
							</div>

							<button
								onClick={() => {
									setEditingItem(null);
									setModalOpen(true);
								}}
								className="text-xs group relative px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
								{/* <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" /> */}
								<div className="relative flex items-center gap-2">
									<FontAwesomeIcon icon={faPlus} className="text-sm" />
									<span>{t("addWebsite")}</span>
								</div>
							</button>
						</>
					)}
				</div>
			</div>

			{/* Table Card */}
			<div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
				{loading ? (
					<div className="p-12 text-center text-gray-400">
						<FontAwesomeIcon icon={faSpinner} spin size="2x" className="mb-4 text-blue-500" />
						<p>{t("loading")}</p>
					</div>
				) : list.length === 0 ? (
					<div className="p-12 text-center text-gray-400">
						<div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
							<FontAwesomeIcon icon={faGlobe} className="text-2xl text-gray-300" />
						</div>
						<p>{t("noData")}</p>
					</div>
				) : (
					<>
						{/* Desktop View */}
						<div className="hidden md:block overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="bg-gray-50/50 border-b border-gray-100">
										{isBatchMode && (
											<th className="py-2 px-8 w-10 flex items-center justify-center">
												<input type="checkbox" checked={list.length > 0 && selectedIds.length === list.length} onChange={handleSelectAll} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
											</th>
										)}
										<th className="py-2 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("domainName")}</th>
										<th className="py-2 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("websiteUrl")}</th>
										<th className="py-2 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("websiteSystem")}</th>
										<th className="py-2 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("username")}</th>
										<th className="py-2 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("status")}</th>
										<th className="py-2 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("upd")}</th>
										<th className="py-2 px-6 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("actions")}</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-50">
									{list.map((item) => (
										<DesktopWebsiteRow key={item.id} item={item} onEdit={handleEdit} onDelete={handleDelete} t={t} isBatchMode={isBatchMode} isSelected={selectedIds.includes(item.id)} onToggle={toggleSelection} isAdmin={isSuperAdminOrAdmin || isAdvertiser} />
									))}
								</tbody>
							</table>
						</div>

						{/* Mobile View */}
						<div className="md:hidden p-4 space-y-4">
							{list.map((item) => (
								<MobileWebsiteCard key={item.id} item={item} onEdit={handleEdit} onDelete={handleDelete} t={t} isBatchMode={isBatchMode} isSelected={selectedIds.includes(item.id)} onToggle={toggleSelection} isAdmin={isSuperAdminOrAdmin || isAdvertiser} />
							))}
						</div>

						<div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50/50">
							{/* <div className="text-sm text-gray-500">
								{t("showing")} <span className="font-medium text-gray-900">{list.length}</span> {t("of")}{" "}
								<span className="font-medium text-gray-900">{pagination.total}</span> {t("results")}
							</div> */}
							<Pagination
								currentPage={pagination.page}
								total={Math.ceil(pagination.total / pagination.per_page)}
								onPageChange={(page) => loadData(page)}
								pageSize={pagination.per_page}
								onPageSizeChange={(size) => {
									setPagination((prev) => ({ ...prev, per_page: size, page: 1 }));
									// We need to trigger loadData with new size, but since state update is async,
									// we can call loadData directly with new size or use useEffect on pagination.per_page
									// However, standard pattern is to update state and let effect handle or call with explicit args.
									// Here, loadData uses pagination.per_page from state closure, so it might be stale if called immediately.
									// Better to pass size explicitly to loadData or wait for re-render if using effect dependency.
									// Given loadData signature (page=1), it relies on state. Let's update state and rely on effect or wrapper.
									// Actually, standard Pagination component usually just calls callback.
									// Let's modify loadData to accept per_page optional override.
									// Or simply:
									fetchWebsiteList({ page: 1, per_page: size, status: filterStatus }).then((res) => {
										if (res.ok) {
											setList(res.data.list);
											setPagination({ page: 1, per_page: size, total: res.data.total });
										}
									});
								}}
							/>
						</div>
					</>
				)}
			</div>

			<WebsiteFormModal open={modalOpen} initial={editingItem} onClose={() => setModalOpen(false)} onSave={handleSave} t={t} />
		</div>
	);
}
