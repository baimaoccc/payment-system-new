import React, { useEffect, useState } from "react";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { Pagination } from "../../components/common/Pagination.jsx";
import { Select } from "../../components/ui/Select.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPlus, faTimes, faSpinner, faEye, faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { fetchEmailTasks, createOrUpdateEmailTask, deleteEmailTask, fetchEmailTemplates } from "../../controllers/emailController.js";
import { useDispatch } from "react-redux";
import { addToast, setModal } from "../../store/slices/ui.js";
import { EmailTaskListTable } from "../../components/email/EmailTaskListTable.jsx";

const InputRow = ({ label, children, className = "" }) => (
	<div className={`mb-4 ${className}`}>
		<label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">{label}</label>
		{children}
	</div>
);

function EmailTaskFormModal({ open, initial, onClose, onSave, t, readOnly, templates }) {
	const [form, setForm] = useState({ template_id: "", orderNo: "", status: "2" });
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (!initial) {
			setForm({ template_id: "", orderNo: "", status: "2" });
			return;
		}
		const templateId = initial.template_id ?? initial.templateId ?? "";
		const orderNo = initial.orderNo ?? initial.order_no ?? "";
		const statusValue = initial.status != null ? String(initial.status) : "2";
		setForm({ template_id: String(templateId || ""), orderNo: orderNo || "", status: statusValue });
	}, [initial]);

	if (!open) return null;

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (readOnly) {
			onClose();
			return;
		}
		if (!form.template_id || !form.orderNo || !form.status) return;
		setSaving(true);
		const res = await onSave(form);
		setSaving(false);
		if (res) onClose();
	};

	const statusOptions = [
		{ value: "2", label: t("taskStatus_pending") },
		{ value: "1", label: t("taskStatus_sent") },
		{ value: "3", label: t("taskStatus_cancelled") },
		{ value: "4", label: t("taskStatus_failed") },
	];

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
			<div className="bg-white rounded-xl overflow-hidden shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
				<div className="flex items-center justify-between p-6 border-b border-gray-100">
					<h3 className="text-xl font-bold text-gray-800">{readOnly ? t("viewEmailTask") : initial ? t("editEmailTask") : t("addEmailTask")}</h3>
					<button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
						<FontAwesomeIcon icon={faTimes} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<InputRow label={t("emailTemplate")}>
							<Select value={String(form.template_id || "")} onChange={(val) => setForm({ ...form, template_id: val })} options={templates.map((tpl) => ({ value: String(tpl.id), label: tpl.name || tpl.title || `#${tpl.id}` }))} placeholder={t("selectEmailTemplate")} isDisabled={readOnly} />
						</InputRow>
						<InputRow label={t("orderNo")}>
							<input type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm" value={form.orderNo} onChange={(e) => setForm({ ...form, orderNo: e.target.value })} disabled={readOnly} />
						</InputRow>
					</div>

					<InputRow label={t("status")}>
						<Select value={form.status} onChange={(val) => setForm({ ...form, status: val })} options={statusOptions} isDisabled={readOnly} />
					</InputRow>
				</form>

				<div className="flex justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50">
					<button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100">
						{t("cancel")}
					</button>
					{!readOnly && (
						<button type="button" onClick={handleSubmit} disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 flex items-center gap-2">
							{saving && <FontAwesomeIcon icon={faSpinner} spin className="text-xs" />}
							<span>{t("save")}</span>
						</button>
					)}
				</div>
			</div>
		</div>
	);
}

const MobileEmailTaskCard = ({ item, onView, onEdit, onDelete, t, templates, formatDate }) => {
	const getTemplateName = (templateId) => {
		const tpl = templates && templates.find((t) => String(t.id) === String(templateId));
		return tpl ? tpl.name || tpl.title || `#${tpl.id}` : templateId;
	};

	const renderStatus = (status) => {
		const value = String(status);
		if (value === "1")
			return {
				txt: t("taskStatus_sent"),
				bg: "bg-green-50 text-green-700 border-green-100",
			};
		if (value === "2" || value === "待发")
			return {
				txt: t("taskStatus_pending"),
				bg: "bg-yellow-50 text-yellow-700 border-yellow-100",
			};
		if (value === "3")
			return {
				txt: t("taskStatus_cancelled"),
				bg: "bg-gray-100 text-gray-600 border-gray-200",
			};
		if (value === "4" || value === "失败")
			return {
				txt: t("taskStatus_failed"),
				bg: "bg-red-50 text-red-700 border-red-100",
			};
		return { txt: status, bg: "bg-gray-50 text-gray-600 border-gray-100" };
	};

	const { txt, bg } = renderStatus(item.status);

	return (
		<div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
			<div className="flex justify-between items-start mb-3">
				<div className="flex-1 min-w-0 mr-3">
					<div className="flex items-center gap-2 mb-1">
						<span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs font-mono shrink-0">#{item.id}</span>
						<h3 className="font-bold text-gray-900 line-clamp-1 break-all">{item.orderNo || item.order_no}</h3>
					</div>
					<div className="flex flex-wrap gap-2 mt-2">
						<span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${bg}`}>
							{txt}
						</span>
						<span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 max-w-[150px] truncate">
							{getTemplateName(item.template_id)}
						</span>
					</div>
				</div>
			</div>

			<div className="flex items-center justify-between pt-3 border-t border-gray-50">
				<div className="flex flex-col gap-0.5 text-[10px] text-gray-400">
					{item.createtime && <span>{t("crt")}: {formatDate(item.createtime)}</span>}
					{item.updatetime && <span>{t("upd")}: {formatDate(item.updatetime)}</span>}
				</div>
				<div className="flex items-center gap-2">
					<button 
						onClick={() => onView(item)} 
						className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
						title={t("view")}
					>
						<FontAwesomeIcon icon={faEye} size="sm" />
					</button>
					<button 
						onClick={() => onEdit(item)} 
						className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
						title={t("edit")}
					>
						<FontAwesomeIcon icon={faPen} size="sm" />
					</button>
					<button 
						onClick={() => onDelete(item.id)} 
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

export function EmailTaskView() {
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
	const [templates, setTemplates] = useState([]);

	const refresh = async () => {
		setLoading(true);
		const taskRes = await fetchEmailTasks({ page, per_page: pageSize });
		setLoading(false);
		if (taskRes.ok) {
			const backendData = taskRes.data?.data || {};
			setList(backendData.list || []);
			setTotal(backendData.total || 0);
		} else {
			const message = taskRes.error?.message || t("loadFailed");
			dispatch(addToast({ id: Date.now(), type: "error", message }));
		}
	};

	useEffect(() => {
		const loadTemplates = async () => {
			const tplRes = await fetchEmailTemplates({ page: 1, per_page: 100 });
			if (tplRes.ok) {
				const tplData = tplRes.data?.data || {};
				setTemplates(tplData.list || []);
			}
		};
		loadTemplates();
	}, []);

	useEffect(() => {
		refresh();
	}, [page, pageSize]);

	const handleSave = async (data) => {
		const payload = { ...data };
		if (payload.template_id !== "" && !Number.isNaN(Number(payload.template_id))) payload.template_id = Number(payload.template_id);
		if (payload.status !== "" && !Number.isNaN(Number(payload.status))) payload.status = Number(payload.status);
		if (editing?.id) payload.id = editing.id;
		const res = await createOrUpdateEmailTask(payload);
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
				title: t("deleteEmailTask") || "Delete Email Task",
				message: t("confirmDelete"),
				variant: "danger",
				showCancel: true,
				confirmText: t("confirm"),
				cancelText: t("cancel"),
				onConfirm: async () => {
					const res = await deleteEmailTask(id);
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

	const handleEdit = (item) => {
		setEditing(item);
		setViewMode(false);
		setModalOpen(true);
	};

	const handleView = (item) => {
		setEditing(item);
		setViewMode(true);
		setModalOpen(true);
	};


	const formatDate = (ts) => {
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
						<h1 className="text-2xl font-bold text-gray-900">{t("emailTaskManagement")}</h1>
						<p className="text-sm text-gray-500 mt-1">{t("emailTaskManagementDesc")}</p>
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
					{t("addEmailTask")}
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
						<MobileEmailTaskCard 
							key={item.id} 
							item={item} 
							onView={handleView}
							onEdit={handleEdit} 
							onDelete={handleDelete} 
							t={t} 
							templates={templates}
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
					<EmailTaskListTable list={list} t={t} templates={templates} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
				)}

				<div className="border-t border-gray-100 bg-gray-50/30 p-4">
					<Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={setPageSize} />
				</div>
			</div>

			<EmailTaskFormModal key={`${viewMode ? "view" : "edit"}-${editing?.id || "new"}`} initial={editing} onClose={() => setModalOpen(false)} onSave={handleSave} readOnly={viewMode} t={t} templates={templates} open={modalOpen} />
		</div>
	);
}
