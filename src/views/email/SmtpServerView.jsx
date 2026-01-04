import React, { useEffect, useState } from "react";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPlus, faTimes, faSpinner, faTrash, faPen, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { fetchSmtpList, createOrUpdateSmtp, deleteSmtp, fetchSmtpDetail } from "../../controllers/smtpController.js";
import { Pagination } from "../../components/common/Pagination.jsx";
import { addToast, setModal } from "../../store/slices/ui.js";

const MobileSmtpServerCard = ({ item, onView, onEdit, onDelete, t, formatDate, actionLoading }) => {
	const [expanded, setExpanded] = useState(false);

	return (
		<div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
			<div className="flex justify-between items-start mb-3">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">#{item.id}</div>
					<div>
						<div className="font-bold text-gray-900">{item.host}</div>
						<div className="text-xs text-gray-500 mt-0.5">{item.username}</div>
					</div>
				</div>
				<div className={`px-2 py-1 rounded text-xs font-medium ${item.secure ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-600"}`}>{item.secure || "None"}</div>
			</div>

			<div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600 mb-4">
				<div className="flex flex-col">
					<span className="text-xs text-gray-400 mb-0.5">{t("smtpPort")}</span>
					<span className="font-medium">{item.port}</span>
				</div>
				<div className="flex flex-col">
					<span className="text-xs text-gray-400 mb-0.5">{t("smtpFromEmail")}</span>
					<span className="font-medium break-all">{item.from_email}</span>
				</div>
			</div>

			{expanded && (
				<div className="border-t border-gray-50 pt-3 mb-4 space-y-3 animate-fade-in">
					<div>
						<div className="text-xs text-gray-400 mb-1">{t("smtpFromName")}</div>
						<div className="text-sm text-gray-700">{item.from_name || "-"}</div>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<div className="text-xs text-gray-400 mb-1">{t("crt")}</div>
							<div className="text-xs text-gray-500">{formatDate(item.createtime)}</div>
						</div>
						<div>
							<div className="text-xs text-gray-400 mb-1">{t("upd")}</div>
							<div className="text-xs text-gray-500">{formatDate(item.updatetime)}</div>
						</div>
					</div>
				</div>
			)}

			<div className="flex items-center justify-between pt-3 border-t border-gray-100">
				<button onClick={() => setExpanded(!expanded)} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
					{expanded ? (
						<>
							<span>{t("clickToCollapse")}</span>
						</>
					) : (
						<>
							<span>{t("clickToExpand")}</span>
						</>
					)}
				</button>
				<div className="flex items-center gap-2">
					<button
						onClick={() => onView(item)}
						disabled={actionLoading === `view-${item.id}`}
						className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
						{actionLoading === `view-${item.id}` ? <FontAwesomeIcon icon={faSpinner} spin className="text-sm" /> : <FontAwesomeIcon icon={faEye} className="text-sm" />}
					</button>
					<button
						onClick={() => onEdit(item)}
						disabled={actionLoading === `edit-${item.id}`}
						className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
						{actionLoading === `edit-${item.id}` ? <FontAwesomeIcon icon={faSpinner} spin className="text-sm" /> : <FontAwesomeIcon icon={faPen} className="text-sm" />}
					</button>
					<button onClick={() => onDelete(item.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors">
						<FontAwesomeIcon icon={faTrash} className="text-sm" />
					</button>
				</div>
			</div>
		</div>
	);
};

const InputRow = ({ label, children }) => (
	<div className="mb-4">
		<label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">{label}</label>
		{children}
	</div>
);

function SmtpFormModal({ open, initial, onClose, onSave, t, readOnly }) {
	const [form, setForm] = useState(
		initial || {
			host: "",
			port: "",
			username: "",
			password: "",
			from_name: "",
			from_email: "",
			secure: "",
		}
	);
	const [saving, setSaving] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	useEffect(() => {
		setForm(
			initial || {
				host: "",
				port: "",
				username: "",
				password: "",
				from_name: "",
				from_email: "",
				secure: "",
			}
		);
	}, [initial]);

	if (!open) return null;

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (readOnly) {
			onClose();
			return;
		}
		if (!form.host || !form.port || !form.username || !form.password || !form.from_email) return;
		setSaving(true);
		const res = await onSave(form);
		setSaving(false);
		if (res) onClose();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
			<div className="bg-white overflow-hidden rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
				<div className="flex items-center justify-between p-6 border-b border-gray-100">
					<h3 className="text-xl font-bold text-gray-800">{readOnly ? t("viewSmtpServer") : initial ? t("editSmtpServer") : t("addSmtpServer")}</h3>
					<button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
						<FontAwesomeIcon icon={faTimes} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<InputRow label={t("smtpHost")}>
							<input type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm" value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} disabled={readOnly} />
						</InputRow>
						<InputRow label={t("smtpPort")}>
							<input type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm" value={form.port} onChange={(e) => setForm({ ...form, port: e.target.value })} disabled={readOnly} />
						</InputRow>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<InputRow label={t("smtpUsername")}>
							<input type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} disabled={readOnly} />
						</InputRow>
						<InputRow label={t("smtpPassword")}>
							<div className="flex items-center relative">
								<input type={showPassword ? "text" : "password"} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} disabled={readOnly} />
								{!readOnly && (
									<button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute bottom-[-4px] right-2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
										<FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
									</button>
								)}
							</div>
						</InputRow>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<InputRow label={t("smtpFromName")}>
							<input type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm" value={form.from_name} onChange={(e) => setForm({ ...form, from_name: e.target.value })} disabled={readOnly} />
						</InputRow>
						<InputRow label={t("smtpFromEmail")}>
							<input type="email" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm" value={form.from_email} onChange={(e) => setForm({ ...form, from_email: e.target.value })} disabled={readOnly} />
						</InputRow>
					</div>

					<InputRow label={t("smtpSecure")}>
						<input type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm" value={form.secure || ""} disabled />
					</InputRow>
				</form>

				<div className="flex justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50">
					<button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100">
						{t("cancel")}
					</button>
					{!readOnly && (
						<button type="button" onClick={handleSubmit} disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
							{saving && <FontAwesomeIcon icon={faSpinner} spin className="text-xs" />}
							<span>{t("save")}</span>
						</button>
					)}
				</div>
			</div>
		</div>
	);
}

export function SmtpServerView() {
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
	const [actionLoading, setActionLoading] = useState(null);

	const refresh = async () => {
		setLoading(true);
		const res = await fetchSmtpList({ page, per_page: pageSize });
		setLoading(false);
		if (res.ok) {
			const data = res.data?.data || {};
			setList(data.list || []);
			setTotal(data.total || 0);
		} else {
			const message = res.error?.message || t("loadFailed");
			dispatch(addToast({ id: Date.now(), type: "error", message }));
		}
	};

	useEffect(() => {
		refresh();
	}, [page, pageSize]);

	const handleSave = async (data) => {
		const payload = { ...data };
		if (editing?.id) payload.id = editing.id;
		const res = await createOrUpdateSmtp(payload);
		if (res.ok) {
			dispatch(addToast({ id: Date.now(), type: "success", message: t("saveSuccess") }));
			refresh();
			return true;
		} else {
			const message = res.error?.message || t("saveFailed");
			dispatch(addToast({ id: Date.now(), type: "error", message }));
			return false;
		}
	};

	const handleDelete = (id) => {
		dispatch(
			setModal({
				title: t("deleteSmtpServer"),
				message: t("confirmDelete"),
				variant: "danger",
				showCancel: true,
				confirmText: t("confirm"),
				cancelText: t("cancel"),
				onConfirm: async () => {
					const res = await deleteSmtp(id);
					if (res.ok) {
						dispatch(addToast({ id: Date.now(), type: "success", message: t("deleteSuccess") }));
						refresh();
					} else {
						const message = res.error?.message || t("deleteFailed");
						dispatch(addToast({ id: Date.now(), type: "error", message }));
					}
				},
			})
		);
	};

	const handleView = async (item) => {
		setActionLoading(`view-${item.id}`);
		const res = await fetchSmtpDetail(item.id);
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
			dispatch(addToast({ id: Date.now(), type: "warning", message: t("loadFailed") }));
		}
	};

	const handleEdit = async (item) => {
		setActionLoading(`edit-${item.id}`);
		const res = await fetchSmtpDetail(item.id);
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
			dispatch(addToast({ id: Date.now(), type: "warning", message: t("loadFailed") }));
		}
	};

	const formatDateTime = (ts) => {
		if (!ts) return "-";
		return new Date(ts * 1000).toLocaleString();
	};

	return (
		<div className="p-4 md:p-6 max-w-[1600px] mx-auto">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
				<div className="flex items-center gap-4">
					<div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 hidden sm:flex">
						<FontAwesomeIcon icon={faEnvelope} className="text-xl" />
					</div>
					<div>
						<h1 className="text-2xl font-bold text-gray-900">{t("smtpServerManagement")}</h1>
						<p className="text-sm text-gray-500 mt-1">{t("smtpServerManagementDesc")}</p>
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
					{t("addSmtpServer")}
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
						<MobileSmtpServerCard 
							key={item.id} 
							item={item} 
							onView={handleView}
							onEdit={handleEdit} 
							onDelete={handleDelete} 
							t={t} 
							formatDate={formatDateTime}
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
									<th className="px-3 py-3 text-left font-medium text-gray-700 w-1/5">{t("smtpHost")}</th>
									<th className="px-3 py-3 text-left font-medium text-gray-700">{t("smtpUsername")}</th>
									<th className="px-3 py-3 text-left font-medium text-gray-700">{t("smtpFromEmail")}</th>
									<th className="px-3 py-3 text-left font-medium text-gray-700 w-1/6">{t("timeline")}</th>
									<th className="px-3 py-3 text-left font-medium text-gray-700 w-20">{t("actions")}</th>
								</tr>
							</thead>
							<tbody>
								{list.length > 0 ? (
									list.map((item) => (
										<tr key={item.id} className="border-t hover:bg-gray-50">
											<td className="p-3 align-top font-mono text-gray-500">#{item.id}</td>
											<td className="p-3 align-top">
												<div className="font-bold text-gray-900 text-sm">{item.host}</div>
												<div className="text-gray-500 text-[11px]">{item.port}</div>
											</td>
											<td className="p-3 align-top">
												<div className="text-gray-800 text-xs truncate max-w-xs" title={item.username}>
													{item.username}
												</div>
											</td>
											<td className="p-3 align-top">
												<div className="text-gray-800 text-xs">{item.from_email}</div>
												<div className="text-gray-500 text-[11px]">{item.from_name}</div>
											</td>
											<td className="p-3 align-top">
												<div className="text-gray-500 text-[11px]">
													{t("crt")}: {formatDateTime(item.createtime)}
												</div>
												<div className="text-gray-500 text-[11px]">
													{t("upd")}: {formatDateTime(item.updatetime)}
												</div>
											</td>
											<td className="p-3 align-top">
												<div className="flex items-center gap-2 text-xs">
													<button
														type="button"
														onClick={() => handleView(item)}
														disabled={actionLoading === `view-${item.id}`}
														className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
														{actionLoading === `view-${item.id}` ? <FontAwesomeIcon icon={faSpinner} spin className="h-3" /> : <FontAwesomeIcon icon={faEye} className="h-3" />}
													</button>
													<button
														type="button"
														onClick={() => handleEdit(item)}
														disabled={actionLoading === `edit-${item.id}`}
														className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
														{actionLoading === `edit-${item.id}` ? <FontAwesomeIcon icon={faSpinner} spin className="h-3" /> : <FontAwesomeIcon icon={faPen} className="h-3" />}
													</button>
													<button type="button" onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 flex items-center gap-1">
														<FontAwesomeIcon icon={faTrash} className="h-3" />
													</button>
												</div>
											</td>
										</tr>
									))
								) : (
									<tr>
										<td colSpan="6" className="px-4 py-8 text-center text-gray-400">
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

			<SmtpFormModal key={`${viewMode ? "view" : "edit"}-${editing?.id || "new"}`} initial={editing} onClose={() => setModalOpen(false)} onSave={handleSave} readOnly={viewMode} t={t} open={modalOpen} />
		</div>
	);
}
