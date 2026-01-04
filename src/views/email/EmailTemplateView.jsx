import React, { useEffect, useState, useMemo } from "react";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { Pagination } from "../../components/common/Pagination.jsx";
import { Select } from "../../components/ui/Select.jsx";
import { RichTextEditor } from "../../components/ui/RichTextEditor.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash, faPlus, faEnvelope, faTimes, faSpinner, faEye } from "@fortawesome/free-solid-svg-icons";
import { fetchEmailTemplates, createEmailTemplate, deleteEmailTemplate, fetchEmailTypes, fetchEmailTemplate, fetchEmailTypesN } from "../../controllers/emailController.js";
import { fetchEmailTemplatesForOrders } from "../../controllers/ordersController.js";
import { useDispatch } from "react-redux";
import { addToast, setEmailTemplatesAll } from "../../store/slices/ui.js";

const InputRow = ({ label, children, className = "" }) => (
	<div className={`mb-4 ${className}`}>
		<label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">{label}</label>
		{children}
	</div>
);

function EmailTemplateFormModal({ open, initial, onClose, onSave, t, readOnly, emailTypes = [] }) {
	const [form, setForm] = useState(initial || { name: "", type_id: "", template: "", description: "" });
	const [saving, setSaving] = useState(false);
	const dispatch = useDispatch();

	function decodeHtmlStr(html) {
		if (typeof html !== "string") return "";
		const div = document.createElement("div");
		div.innerHTML = html;
		const decoded = div.textContent || div.innerText || "";
		return decoded.replace(/\u00a0|&nbsp;/g, " ");
	}

	function isHtml(str) {
		if (typeof str !== "string" || !str.trim()) return false;
		const s = decodeHtmlStr(str).trim();
		if (!s) return false;
		return /<([A-Za-z][A-Za-z0-9]*)\b[^>]*>([\s\S]*?)<\/\1>|<([A-Za-z][A-Za-z0-9]*)\b[^>]*\/>/i.test(s);
	}

	function toForm(data) {
		if (!data || typeof data !== "object") return { name: "", type_id: "", template: "", description: "" };
		const name = data.name ?? data.title ?? "";
		const typeId = data.type_id ?? data.typeId ?? "";
		const description = data.description ?? data.desc ?? "";
		const rawTpl = data.template ?? data.tpl ?? data.content ?? "";
		const template = decodeHtmlStr(rawTpl);
		return { ...data, name, type_id: typeId, description, template };
	}

	function extractVariablePlaceholder(str) {
		if (typeof str !== "string") return "";
		const start = str.indexOf("{");
		const end = str.indexOf("}", start + 1);
		if (start === -1 || end === -1) return str.trim();
		return str.slice(start, end + 1);
	}

	function copyVariable(str) {
		const text = extractVariablePlaceholder(str);
		if (!text) return;
		if (navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard
				.writeText(text)
				.then(() => {
					dispatch(addToast({ type: "success", message: t("variableCopied") }));
				})
				.catch(() => {
					dispatch(addToast({ type: "error", message: t("variableCopyFailed") }));
				});
		}
	}

	useEffect(() => {
		setForm(toForm(initial));
	}, [initial, open]);

	if (!open) return null;

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (readOnly) {
			onClose();
			return;
		}
		if (!form.name || !form.type_id) return;
		setSaving(true);
		const res = await onSave(form);
		setSaving(false);
		if (res) onClose();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
			<div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-scale-in">
				<div className="flex items-center justify-between p-6 border-b border-gray-100">
					<h3 className="text-xl font-bold text-gray-800">{readOnly ? t("viewEmailTemplate") : initial ? t("editEmailTemplate") : t("addEmailTemplate")}</h3>
					<button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all">
						<FontAwesomeIcon icon={faTimes} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<InputRow label={t("templateName")}>
							<input type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm disabled:bg-gray-100 disabled:text-gray-500" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("templateNamePlaceholder")} required disabled={readOnly} />
						</InputRow>

						<InputRow label={t("emailType")}>
							<Select value={String(form.type_id || "")} onChange={(val) => setForm({ ...form, type_id: val })} options={(emailTypes || []).map((type) => ({ value: String(type.id), label: type.type_name }))} placeholder={t("selectEmailType")} isDisabled={readOnly} />
						</InputRow>

						<InputRow label={t("status")}>
							<Select
								value={form.status}
								onChange={(val) => setForm({ ...form, status: val })}
								options={[
									{ value: 1, label: t("active") || "Active" },
									{ value: 0, label: t("inactive") || "Inactive" },
								]}
								placeholder={t("selectStatus")}
								isDisabled={readOnly}
							/>
						</InputRow>
					</div>

					<InputRow label={t("description")}>
						<textarea className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm min-h-[60px] disabled:bg-gray-100 disabled:text-gray-500" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={t("descriptionPlaceholder")} disabled={readOnly} />
					</InputRow>

					<InputRow label={t("templateContent")}>
						<RichTextEditor value={form.template} onChange={(val) => setForm({ ...form, template: val })} placeholder={t("templateContentPlaceholder")} readOnly={readOnly} />
					</InputRow>

					<InputRow label={t("templatePreview")}>
						<div className="bg-white py-4 px-2 border-gray-200 rounded-lg overflow-hidden">
							<div className="max-w-2xl mx-auto text-sm">{isHtml(form.template) ? <div dangerouslySetInnerHTML={{ __html: decodeHtmlStr(form.template) || "" }} /> : <div className="p-4 whitespace-pre-wrap text-sm text-gray-800">{form.template || ""}</div>}</div>
						</div>
					</InputRow>

					{(() => {
						const currentType = (emailTypes || []).find((type) => String(type.id) === String(form.type_id));
						if (!currentType) return null;
						const orderVars = (currentType.order_variable || "")
							.split("|")
							.map((v) => v.trim())
							.filter(Boolean);
						const logisticsVars = (currentType.logistics_variable || "")
							.split("|")
							.map((v) => v.trim())
							.filter(Boolean);
						const clientVars = (currentType.client_variable || "")
							.split("|")
							.map((v) => v.trim())
							.filter(Boolean);
						if (!orderVars.length && !logisticsVars.length && !clientVars.length) return null;
						return (
							<InputRow label={t("variables")}>
								<div className="p-6 text-xs">
									{orderVars.length > 0 && (
										<div>
											<div className="mb-2 text-gray-500">{t("orderVariable")}</div>
											<div className="flex flex-wrap gap-2">
												{orderVars.map((item, index) => (
													<span key={`order-${index}`} className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200" onClick={() => copyVariable(item)} title={t("clickToCopy")}>
														{item}
													</span>
												))}
											</div>
										</div>
									)}
									{logisticsVars.length > 0 && (
										<div>
											<div className="mb-2 text-gray-500">{t("logisticsVariable")}</div>
											<div className="flex flex-wrap gap-2">
												{logisticsVars.map((item, index) => (
													<span key={`logistics-${index}`} className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200" onClick={() => copyVariable(item)} title={t("clickToCopy")}>
														{item}
													</span>
												))}
											</div>
										</div>
									)}
									{clientVars.length > 0 && (
										<div>
											<div className="mb-2 text-gray-500">{t("clientVariable")}</div>
											<div className="flex flex-wrap gap-2">
												{clientVars.map((item, index) => (
													<span key={`client-${index}`} className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200" onClick={() => copyVariable(item)} title={t("clickToCopy")}>
														{item}
													</span>
												))}
											</div>
										</div>
									)}
								</div>
							</InputRow>
						);
					})()}

					<div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
						<button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
							{readOnly ? t("close") : t("cancel")}
						</button>
						{!readOnly && (
							<button type="submit" disabled={saving} className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-lg shadow-blue-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
								{saving && <FontAwesomeIcon icon={faSpinner} spin />}
								{saving ? t("saving") : t("save")}
							</button>
						)}
					</div>
				</form>
			</div>
		</div>
	);
}

const MobileEmailTemplateCard = ({ item, onView, onEdit, onDelete, t, getTypeName, formatDate, actionLoading }) => {
	const [expanded, setExpanded] = useState(false);

	return (
		<div className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 transition-all duration-200 ${expanded ? "ring-1 ring-blue-100" : ""}`}>
			<div className="flex justify-between items-start mb-3">
				<div className="flex-1 min-w-0 mr-3">
					<div className="flex items-center gap-2 mb-1">
						<span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs font-mono shrink-0">#{item.id}</span>
						<h3 className="font-bold text-gray-900 line-clamp-1 break-all">{item.name}</h3>
					</div>
					<div className="flex flex-wrap gap-2 mt-2">
						<span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
							{getTypeName(item.type_id)}
						</span>
						{item.status == 1 ? (
							<span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-700 border border-green-100">{t("active") || "Active"}</span>
						) : (
							<span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-50 text-gray-700 border border-gray-100">{t("inactive") || "Inactive"}</span>
						)}
					</div>
				</div>
			</div>

			{item.description && (
				<div className="bg-gray-50 rounded-lg p-2.5 mb-3 text-xs text-gray-600 leading-relaxed break-words">
					<span className="font-medium text-gray-500 mr-1">{t("description")}:</span>
					<div className={`break-words ${expanded ? "" : "line-clamp-2"}`} onClick={() => setExpanded(!expanded)}>
						{item.description}
					</div>
					{item.description.length > 50 && (
						<div className="text-center mt-1">
							<button onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }} className="text-[10px] text-blue-500 hover:text-blue-700">
								{expanded ? t("clickToCollapse") || "Collapse" : t("clickToExpand") || "Expand"}
							</button>
						</div>
					)}
				</div>
			)}

			<div className="flex items-center justify-between pt-3 border-t border-gray-50">
				<div className="flex flex-col gap-0.5 text-[10px] text-gray-400">
					{item.createtime && <span>{t("crt")}: {formatDate(item.createtime).split(" ")[0]}</span>}
					{item.updatetime && <span>{t("upd")}: {formatDate(item.updatetime).split(" ")[0]}</span>}
				</div>
				<div className="flex items-center gap-2">
					<button 
						onClick={() => onView(item)} 
						disabled={!!actionLoading} 
						className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
						title={t("view")}
					>
						{actionLoading === `view-${item.id}` ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faEye} size="sm" />}
					</button>
					<button 
						onClick={() => onEdit(item)} 
						disabled={!!actionLoading} 
						className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
						title={t("edit")}
					>
						{actionLoading === `edit-${item.id}` ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faPen} size="sm" />}
					</button>
					<button 
						onClick={() => onDelete(item.id)} 
						disabled={!!actionLoading} 
						className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
						title={t("delete")}
					>
						<FontAwesomeIcon icon={faTrash} size="sm" />
					</button>
				</div>
			</div>
		</div>
	);
};

export function EmailTemplateView() {
	const { t } = useI18n();
	const dispatch = useDispatch();
	const [list, setList] = useState([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(20);
	const [loading, setLoading] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [editing, setEditing] = useState(null);
	const [viewMode, setViewMode] = useState(false);
	const [emailTypes, setEmailTypes] = useState([]);

	const refresh = async () => {
		setLoading(true);
		const [templateRes, typesRes] = await Promise.all([
			fetchEmailTemplates({ page, per_page: pageSize }),
			fetchEmailTypesN(), // Fetch all types for mapping
		]);

		setLoading(false);

		if (templateRes.ok) {
			const backendData = templateRes.data?.data || {};
			setList(backendData.list || []);
			setTotal(backendData.total || 0);
		} else {
			dispatch(addToast({ id: Date.now(), type: "error", message: templateRes.error?.message || "Failed to fetch list" }));
		}

		if (typesRes.ok) {
			const typesData = typesRes.data?.data || {};
			setEmailTypes(typesData.list || []);
		}
	};

	useEffect(() => {
		refresh();
	}, [page, pageSize]);

	const handleSave = async (data) => {
		const payload = { ...data };
		if (payload.type_id !== "" && !Number.isNaN(Number(payload.type_id))) payload.type_id = Number(payload.type_id);
		if (editing?.id) payload.id = editing.id;
		const res = await createEmailTemplate(payload);
		if (res.ok) {
			const updated = res.data?.data || res.data || payload;
			setEditing(updated);
			dispatch(addToast({ id: Date.now(), type: "success", message: t("saveSuccess") }));
			refresh();
			const tplRes = await fetchEmailTemplatesForOrders();
			if (tplRes && tplRes.ok) dispatch(setEmailTemplatesAll(tplRes.data || []));
			return true;
		} else {
			dispatch(addToast({ id: Date.now(), type: "error", message: res.error?.message || t("saveFailed") }));
			return false;
		}
	};

	const handleDelete = (id) => {
		dispatch(
			setModal({
				title: t("deleteEmailTemplate"),
				message: t("confirmDelete"),
				variant: "danger",
				showCancel: true,
				confirmText: t("confirm"),
				cancelText: t("cancel"),
				onConfirm: async () => {
					const res = await deleteEmailTemplate(id);
					if (res.ok) {
						dispatch(addToast({ id: Date.now(), type: "success", message: t("deleteSuccess") }));
						refresh();
						const tplRes = await fetchEmailTemplatesForOrders();
						if (tplRes && tplRes.ok) dispatch(setEmailTemplatesAll(tplRes.data || []));
					} else {
						dispatch(addToast({ id: Date.now(), type: "error", message: res.error?.message || t("deleteFailed") }));
					}
				},
			})
		);
	};

	const [actionLoading, setActionLoading] = useState(null);

	const handleEdit = async (item) => {
		setActionLoading(`edit-${item.id}`);
		const res = await fetchEmailTemplate({ id: item.id });
		setActionLoading(null);
		if (res.ok) {
			const data = res.data?.data || res.data || item;
			setEditing(data);
			setViewMode(false);
			setModalOpen(true);
		} else {
			setEditing(item);
			setViewMode(false);
			setModalOpen(true);
			dispatch(addToast({ id: Date.now(), type: "warning", message: t("fetchDetailFailed") }));
		}
	};

	const handleView = async (item) => {
		setActionLoading(`view-${item.id}`);
		const res = await fetchEmailTemplate({ id: item.id });
		setActionLoading(null);
		if (res.ok) {
			const data = res.data?.data || res.data || item;
			setEditing(data);
			setViewMode(true);
			setModalOpen(true);
		} else {
			setEditing(item);
			setViewMode(true);
			setModalOpen(true);
			dispatch(addToast({ id: Date.now(), type: "warning", message: t("fetchDetailFailed") }));
		}
	};

	const formatDate = (ts) => {
		if (!ts) return "-";
		return new Date(ts * 1000).toLocaleString();
	};

	// Map type_id to type_name
	const getTypeName = (typeId) => {
		const type = emailTypes.find((t) => t.id == typeId);
		return type ? type.type_name : typeId;
	};

	return (
		<div className="p-4 md:p-6 max-w-[1600px] mx-auto">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
				<div className="flex items-center gap-4">
					<div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 hidden sm:flex">
						<FontAwesomeIcon icon={faEnvelope} className="text-xl" />
					</div>
					<div>
						<h1 className="text-2xl font-bold text-gray-900">{t("emailTemplateManagement")}</h1>
						<p className="text-sm text-gray-500 mt-1">{t("emailTemplateManagementDesc")}</p>
					</div>
				</div>
				<button
					onClick={() => {
						setEditing(null);
						setViewMode(false);
						setModalOpen(true);
					}}
					className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2">
					<FontAwesomeIcon icon={faPlus} />
					{t("addEmailTemplate")}
				</button>
			</div>

			{/* Mobile/Tablet View (Cards) */}
			<div className="lg:hidden space-y-4 mb-4">
				{loading ? (
					<div className="bg-white rounded-xl p-8 text-center text-gray-400 shadow-sm border border-gray-100">
						<FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
						{t("loading")}
					</div>
				) : (list || []).length === 0 ? (
					<div className="bg-white rounded-xl p-8 text-center text-gray-400 shadow-sm border border-gray-100">
						{t("noData")}
					</div>
				) : (
					(list || []).map((item) => (
						<MobileEmailTemplateCard 
							key={item.id} 
							item={item} 
							onView={handleView}
							onEdit={handleEdit} 
							onDelete={() => handleDelete(item.id)} 
							t={t} 
							getTypeName={getTypeName}
							formatDate={formatDate}
							actionLoading={actionLoading}
						/>
					))
				)}
				<div className="mt-4">
					<Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={setPageSize} />
				</div>
			</div>

			{/* Desktop View (Table) */}
			<div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
				{loading ? (
					<div className="p-12 text-center text-gray-400">
						<FontAwesomeIcon icon={faSpinner} spin className="text-3xl mb-3" />
						<p>{t("loading")}</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full text-xs">
							<thead className="bg-gray-100">
								<tr>
									<th className="px-3 py-3 text-left font-medium text-gray-700 w-16">ID</th>
									<th className="px-3 py-3 text-left font-medium text-gray-700 w-1/5">{t("templateName")}</th>
									<th className="px-3 py-3 text-left font-medium text-gray-700 w-1/6">{t("emailType")}</th>
									<th className="px-3 py-3 text-left font-medium text-gray-700 w-1/6">{t("status")}</th>
									<th className="px-3 py-3 text-left font-medium text-gray-700">{t("description")}</th>
									<th className="px-3 py-3 text-left font-medium text-gray-700 w-1/6">{t("timeline")}</th>
									<th className="px-3 py-3 text-left font-medium text-gray-700 w-24">{t("actions")}</th>
								</tr>
							</thead>
							<tbody>
								{(list || []).map((item) => (
									<tr key={item.id} className="border-t hover:bg-gray-50 transition-colors">
										<td className="p-3 align-top font-mono text-gray-500">#{item.id}</td>

										<td className="p-3 align-top">
											<div className="font-bold text-gray-900 text-sm">{item.name}</div>
										</td>

										<td className="p-3 align-top">
											<div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">{getTypeName(item.type_id)}</div>
										</td>

										<td className="p-3 align-top">{item.status == 1 ? <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-700 border border-green-100">{t("active") || "Active"}</span> : <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-50 text-gray-700 border border-gray-100">{t("inactive") || "Inactive"}</span>}</td>

										<td className="p-3 align-top">
											<div className="text-gray-600 line-clamp-2 max-w-xl" title={item.description}>
												{item.description}
											</div>
										</td>

										<td className="p-3 align-top">
											<div className="flex flex-col gap-1 text-gray-500">
												{item.createtime && (
													<div title={`${t("created")}: ${formatDate(item.createtime)}`}>
														<span className="text-gray-400 text-[10px] w-8 inline-block">{t("crt")}:</span>
														{formatDate(item.createtime).split(" ")[0]}
													</div>
												)}
												{item.updatetime && (
													<div title={`${t("updated")}: ${formatDate(item.updatetime)}`}>
														<span className="text-gray-400 text-[10px] w-8 inline-block">{t("upd")}:</span>
														{formatDate(item.updatetime).split(" ")[0]}
													</div>
												)}
											</div>
										</td>

										<td className="p-3 align-top">
											<div className="flex items-center gap-3">
												<button onClick={() => handleView(item)} disabled={!!actionLoading} className="text-green-600 hover:text-green-800 transition-colors disabled:opacity-50" title={t("view")}>
													{actionLoading === `view-${item.id}` ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faEye} />}
												</button>
												<button onClick={() => handleEdit(item)} disabled={!!actionLoading} className="text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50" title={t("edit")}>
													{actionLoading === `edit-${item.id}` ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faPen} />}
												</button>
												<button onClick={() => handleDelete(item.id)} disabled={!!actionLoading} className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50" title={t("delete")}>
													<FontAwesomeIcon icon={faTrash} />
												</button>
											</div>
										</td>
									</tr>
								))}
								{(list || []).length === 0 && (
									<tr>
										<td colSpan="7" className="px-4 py-8 text-center text-gray-400">
											{t("noData")}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				)}

				<div className="border-t border-gray-100 bg-gray-50/30 p-4">
					<Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={setPageSize} />
				</div>
			</div>

			<EmailTemplateFormModal key={`${viewMode ? "view" : "edit"}-${editing?.id || "new"}`} initial={editing} onClose={() => setModalOpen(false)} onSave={handleSave} t={t} readOnly={viewMode} emailTypes={emailTypes} open={modalOpen} />
		</div>
	);
}
