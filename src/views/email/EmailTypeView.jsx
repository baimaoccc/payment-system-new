import React, { useEffect, useState } from "react";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { Pagination } from "../../components/common/Pagination.jsx";
import { Select } from "../../components/ui/Select.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash, faPlus, faEnvelope, faTimes, faSpinner, faEye } from "@fortawesome/free-solid-svg-icons";
import { fetchEmailTypes, createEmailType, deleteEmailType, fetchEmailType } from "../../controllers/emailController.js";
import { useDispatch } from "react-redux";
import { addToast } from "../../store/slices/ui.js";

const InputRow = ({ label, children, className = "" }) => (
	<div className={`mb-4 ${className}`}>
		<label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">{label}</label>
		{children}
	</div>
);

function EmailTypeFormModal({ open, initial, onClose, onSave, t, readOnly }) {
	const [form, setForm] = useState(initial || { type_name: "", order_variable: "", logistics_variable: "", client_variable: "", status: 1 });
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		setForm(initial || { type_name: "", order_variable: "", logistics_variable: "", client_variable: "", status: 1 });
	}, [initial]);

	if (!open) return null;

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (readOnly) {
			onClose();
			return;
		}
		if (!form.type_name) return;
		setSaving(true);
		const res = await onSave(form);
		setSaving(false);
		if (res) onClose();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
			<div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-scale-in">
				<div className="flex items-center justify-between p-6 border-b border-gray-100">
					<h3 className="text-xl font-bold text-gray-800">{readOnly ? t("viewEmailType") : initial ? t("editEmailType") : t("addEmailType")}</h3>
					<button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all">
						<FontAwesomeIcon icon={faTimes} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<InputRow label={t("emailTypeName")}>
							<input type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm disabled:bg-gray-100 disabled:text-gray-500" value={form.type_name} onChange={(e) => setForm({ ...form, type_name: e.target.value })} placeholder={t("emailTypeNamePlaceholder")} required disabled={readOnly} />
						</InputRow>

						<InputRow label={t("status")}>
							<Select
								value={form.status !== undefined ? form.status : 1}
								onChange={(val) => setForm({ ...form, status: val })}
								options={[
									{ value: 1, label: t("active") },
									{ value: 0, label: t("inactive") },
								]}
								isDisabled={readOnly}
							/>
						</InputRow>
					</div>

					<InputRow label={t("orderVariable")}>
						<textarea className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm min-h-[120px] disabled:bg-gray-100 disabled:text-gray-500" value={form.order_variable} onChange={(e) => setForm({ ...form, order_variable: e.target.value })} placeholder={t("orderVariablePlaceholder")} disabled={readOnly} />
					</InputRow>

					<InputRow label={t("logisticsVariable")}>
						<textarea className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm min-h-[120px] disabled:bg-gray-100 disabled:text-gray-500" value={form.logistics_variable} onChange={(e) => setForm({ ...form, logistics_variable: e.target.value })} placeholder={t("logisticsVariablePlaceholder")} disabled={readOnly} />
					</InputRow>

					<InputRow label={t("clientVariable")}>
						<textarea className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm min-h-[120px] disabled:bg-gray-100 disabled:text-gray-500" value={form.client_variable} onChange={(e) => setForm({ ...form, client_variable: e.target.value })} placeholder={t("clientVariablePlaceholder")} disabled={readOnly} />
					</InputRow>

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

const MobileEmailTypeCard = ({ item, onView, onEdit, onDelete, onCopy, t, formatDate }) => {
	const [expanded, setExpanded] = useState(false);

	return (
		<div className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 transition-all duration-200 ${expanded ? "ring-1 ring-blue-100" : ""}`}>
			<div className="flex justify-between items-start mb-3">
				<div className="flex-1 min-w-0 mr-3">
					<div className="flex items-center gap-2 mb-1">
						<span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs font-mono shrink-0">#{item.id}</span>
						<h3 className="font-bold text-gray-900 line-clamp-1 break-all">{item.type_name}</h3>
					</div>
					<div className="mt-1">
						<span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${item.status === 1 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
							{item.status === 1 ? t("active") : t("inactive")}
						</span>
					</div>
				</div>
				<div className="flex gap-2 shrink-0">
					<button onClick={() => onEdit(item)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title={t("edit")}>
						<FontAwesomeIcon icon={faPen} size="sm" />
					</button>
					<button onClick={() => onDelete(item.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title={t("delete")}>
						<FontAwesomeIcon icon={faTrash} size="sm" />
					</button>
				</div>
			</div>

			<div className="space-y-2 mb-3">
				{item.order_variable && (
					<div className="bg-gray-50 rounded p-2 text-[10px]" onClick={() => onCopy(item.order_variable)}>
						<div className="text-gray-400 uppercase tracking-wider mb-0.5">{t("orderVariable")}</div>
						<div className="font-mono text-gray-600 break-all">{item.order_variable}</div>
					</div>
				)}
				{expanded && (
					<>
						{item.logistics_variable && (
							<div className="bg-gray-50 rounded p-2 text-[10px]" onClick={() => onCopy(item.logistics_variable)}>
								<div className="text-gray-400 uppercase tracking-wider mb-0.5">{t("logisticsVariable")}</div>
								<div className="font-mono text-gray-600 break-all">{item.logistics_variable}</div>
							</div>
						)}
						{item.client_variable && (
							<div className="bg-gray-50 rounded p-2 text-[10px]" onClick={() => onCopy(item.client_variable)}>
								<div className="text-gray-400 uppercase tracking-wider mb-0.5">{t("clientVariable")}</div>
								<div className="font-mono text-gray-600 break-all">{item.client_variable}</div>
							</div>
						)}
					</>
				)}
				{(item.logistics_variable || item.client_variable) && (
					<div className="text-center">
						<button onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }} className="text-[10px] text-blue-500 hover:text-blue-700">
							{expanded ? t("clickToCollapse") || "Collapse" : t("clickToExpand") || "Expand"}
						</button>
					</div>
				)}
			</div>

			<div className="flex items-center justify-between pt-3 border-t border-gray-50 text-[10px] text-gray-400">
				<div className="flex flex-col gap-0.5">
					{item.createtime && <span>{t("crt")}: {formatDate(item.createtime).split(" ")[0]}</span>}
					{item.updatetime && <span>{t("upd")}: {formatDate(item.updatetime).split(" ")[0]}</span>}
				</div>
				<button onClick={() => onView(item)} className="text-green-600 hover:text-green-800 flex items-center gap-1" title={t("view")}>
					<FontAwesomeIcon icon={faEye} /> {t("view")}
				</button>
			</div>
		</div>
	);
};

export function EmailTypeView() {
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

	const refresh = async () => {
		setLoading(true);
		const res = await fetchEmailTypes({ page, per_page: pageSize });
		setLoading(false);
		if (res.ok) {
			const backendData = res.data?.data || {};
			setList(backendData.list || []);
			setTotal(backendData.total || 0);
		} else {
			dispatch(addToast({ id: Date.now(), type: "error", message: res.error?.message || "Failed to fetch list" }));
		}
	};

	useEffect(() => {
		refresh();
	}, [page, pageSize]);

	const handleSave = async (data) => {
		const res = await createEmailType(data);
		if (res.ok) {
			dispatch(addToast({ id: Date.now(), type: "success", message: t("saveSuccess") }));
			refresh();
			return true;
		} else {
			dispatch(addToast({ id: Date.now(), type: "error", message: res.error?.message || t("saveFailed") }));
			return false;
		}
	};

	const handleDelete = (id) => {
		dispatch(
			setModal({
				title: t("deleteEmailType") || "Delete Email Type",
				message: t("confirmDelete") || "Are you sure you want to delete this item?",
				variant: "danger",
				showCancel: true,
				confirmText: t("confirm") || "Confirm",
				cancelText: t("cancel") || "Cancel",
				onConfirm: async () => {
					const res = await deleteEmailType(id);
					if (res.ok) {
						dispatch(addToast({ id: Date.now(), type: "success", message: t("deleteSuccess") }));
						refresh();
					} else {
						dispatch(addToast({ id: Date.now(), type: "error", message: res.error?.message || t("deleteFailed") }));
					}
				},
			})
		);
	};

	const handleEdit = async (item) => {
		setEditing(item);
		setViewMode(false);
		setModalOpen(true);
	};

	const handleView = (item) => {
		setEditing(item);
		setViewMode(true);
		setModalOpen(true);
	};

	const handleCopy = (text) => {
		if (!text) return;
		navigator.clipboard
			.writeText(text)
			.then(() => {
				dispatch(addToast({ id: Date.now(), type: "success", message: t("copied") }));
			})
			.catch(() => {
				dispatch(addToast({ id: Date.now(), type: "error", message: t("copyFailed") }));
			});
	};

	const formatDate = (ts) => {
		if (!ts) return "-";
		return new Date(ts * 1000).toLocaleString();
	};

	return (
		<div className="p-4 md:p-6 max-w-[1600px] mx-auto">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
				<div className="flex items-center gap-4">
					<div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 hidden sm:flex">
						<FontAwesomeIcon icon={faEnvelope} className="text-xl" />
					</div>
					<div>
						<h1 className="text-2xl font-bold text-gray-900">{t("emailTypeManagement")}</h1>
						<p className="text-sm text-gray-500 mt-1">{t("emailTypeManagementDesc")}</p>
					</div>
				</div>
				<button
					onClick={() => {
						setEditing(null);
						setViewMode(false);
						setModalOpen(true);
					}}
					className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2">
					<FontAwesomeIcon icon={faPlus} />
					{t("addEmailType")}
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
						<MobileEmailTypeCard 
							key={item.id} 
							item={item} 
							onView={handleView}
							onEdit={handleEdit} 
							onDelete={() => handleDelete(item.id)}
							onCopy={handleCopy}
							t={t} 
							formatDate={formatDate}
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
									<th className="px-3 py-3 text-left font-medium text-gray-700 w-1/5">{t("emailTypeName")}</th>
									<th className="px-3 py-3 text-left font-medium text-gray-700">{t("variables")}</th>
									<th className="px-3 py-3 text-left font-medium text-gray-700 w-1/6">{t("timeline")}</th>
									<th className="px-3 py-3 text-left font-medium text-gray-700 w-24">{t("actions")}</th>
								</tr>
							</thead>
							<tbody>
								{(list || []).map((item) => (
									<tr key={item.id} className="border-t hover:bg-gray-50 transition-colors">
										<td className="p-3 align-top font-mono text-gray-500">#{item.id}</td>

										{/* Type Info */}
										<td className="p-3 align-top">
											<div className="flex flex-col gap-1">
												<div className="font-bold text-gray-900 text-sm">{item.type_name}</div>
												<div className="mt-1">
													<span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${item.status === 1 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>{item.status === 1 ? t("active") : t("inactive")}</span>
												</div>
											</div>
										</td>

										{/* Variables Preview */}
										<td className="p-3 align-top">
											<div className="flex flex-col gap-2">
												{item.order_variable && (
													<div className="group relative cursor-pointer hover:bg-blue-50/50 p-1 rounded transition-colors -ml-1" onClick={() => handleCopy(item.order_variable)} title={t("clickToCopy")}>
														<div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-0.5 flex items-center gap-1">
															{t("orderVariable")}
															<span className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500">
																<FontAwesomeIcon icon={faPen} className="text-[8px]" />
															</span>
														</div>
														<div className="text-gray-600 truncate max-w-xl font-mono text-[10px]">{item.order_variable}</div>
													</div>
												)}
												{item.logistics_variable && (
													<div className="group relative cursor-pointer hover:bg-blue-50/50 p-1 rounded transition-colors -ml-1" onClick={() => handleCopy(item.logistics_variable)} title={t("clickToCopy")}>
														<div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">{t("logisticsVariable")}</div>
														<div className="text-gray-600 truncate max-w-xl font-mono text-[10px]">{item.logistics_variable}</div>
													</div>
												)}
												{item.client_variable && (
													<div className="group relative cursor-pointer hover:bg-blue-50/50 p-1 rounded transition-colors -ml-1" onClick={() => handleCopy(item.client_variable)} title={t("clickToCopy")}>
														<div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">{t("clientVariable")}</div>
														<div className="text-gray-600 truncate max-w-xl font-mono text-[10px]">{item.client_variable}</div>
													</div>
												)}
											</div>
										</td>

										{/* Timeline */}
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

										{/* Actions */}
										<td className="p-3 align-top">
											<div className="flex items-center gap-3">
												<button onClick={() => handleView(item)} className="text-green-600 hover:text-green-800 transition-colors" title={t("view")}>
													<FontAwesomeIcon icon={faEye} />
												</button>
												<button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800 transition-colors" title={t("edit")}>
													<FontAwesomeIcon icon={faPen} />
												</button>
												<button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 transition-colors" title={t("delete")}>
													<FontAwesomeIcon icon={faTrash} />
												</button>
											</div>
										</td>
									</tr>
								))}
								{(list || []).length === 0 && (
									<tr>
										<td colSpan="5" className="px-4 py-8 text-center text-gray-400">
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

			<EmailTypeFormModal open={modalOpen} initial={editing} onClose={() => setModalOpen(false)} onSave={handleSave} t={t} readOnly={viewMode} />
		</div>
	);
}
