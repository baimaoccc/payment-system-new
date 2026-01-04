import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { setPage, setPageSize, setList } from "../../store/slices/blacklist.js";
import { setModal } from "../../store/slices/ui.js";
import { fetchBlacklist, createBlacklist, deleteBlacklist } from "../../controllers/blacklistController.js";
import { Pagination } from "../../components/common/Pagination.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash, faTimes, faBan, faPlus, faEnvelope, faPhone, faGlobe, faUser, faSpinner } from "@fortawesome/free-solid-svg-icons";

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

const SectionHeader = ({ title, subtitle }) => (
	<div className="mb-6 mt-2">
		<h4 className="text-base font-bold text-gray-900">{title}</h4>
		{subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
	</div>
);

function BlacklistFormModal({ open, initial, onClose, onSave, t, saving }) {
	const [form, setForm] = useState(initial || { name: "", ip: "", email: "", phone: "" });

	useEffect(() => {
		setForm(initial || { name: "", ip: "", email: "", phone: "" });
	}, [initial]);

	if (!open) return null;
	const save = () => onSave(form);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
			<div className="mx-4 relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
				{/* Header */}
				<div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white z-10">
					<div>
						<h3 className="text-xl font-bold text-gray-900">{initial?.id ? t("editBlacklist") || "Edit Blacklist" : t("addBlacklist") || "Add Blacklist"}</h3>
					</div>
					<button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-50">
						<FontAwesomeIcon icon={faTimes} className="text-xl" />
					</button>
				</div>

				<div className="flex-1 overflow-y-auto py-8 px-6 custom-scrollbar">
					<SectionHeader title={t("basicInfo") || "Basic Information"} />
					<div className="p-6">
						<InputRow icon={faUser} label={t("name") || "Name"}>
							<input value={form.name} onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))} placeholder={t("enterName") || "Enter Name"} className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-300 py-1" />
						</InputRow>

						<InputRow icon={faGlobe} label={t("ipAddress") || "IP Address"}>
							<input value={form.ip} onChange={(e) => setForm((v) => ({ ...v, ip: e.target.value }))} placeholder="e.g. 1.0.0.1" className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-300 py-1" />
						</InputRow>

						<InputRow icon={faEnvelope} label={t("email") || "Email"}>
							<input value={form.email} onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))} placeholder="example@domain.com" className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-300 py-1" />
						</InputRow>

						<InputRow icon={faPhone} label={t("phone") || "Phone"}>
							<input value={form.phone} onChange={(e) => setForm((v) => ({ ...v, phone: e.target.value }))} placeholder="e.g. 13800138000" className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-300 py-1" />
						</InputRow>
					</div>
				</div>

				<div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
					<button type="button" onClick={onClose} disabled={saving} className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
						{t("cancel") || "Cancel"}
					</button>
					<button onClick={save} disabled={saving} className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
						{saving && <FontAwesomeIcon icon={faSpinner} spin />}
						{t("save") || "Save"}
					</button>
				</div>
			</div>
		</div>
	);
}

export function BlacklistView() {
	const dispatch = useDispatch();
	const { t } = useI18n();
	const { list, loading, page, pageSize, total } = useSelector((s) => ({
		list: s.blacklist.list,
		loading: s.blacklist.loading,
		page: s.blacklist.page,
		pageSize: s.blacklist.pageSize,
		total: s.blacklist.total,
	}));

	const [form, setForm] = useState({ name: "", ip: "", email: "", phone: "" });
	const [modalOpen, setModalOpen] = useState(false);
	const [editing, setEditing] = useState(null);
	const [saving, setSaving] = useState(false);

	const refresh = () => fetchBlacklist({ dispatch, page, pageSize });

	useEffect(() => {
		refresh();
	}, [dispatch, page, pageSize]);

	const onAdd = () => {
		setEditing(null);
		setForm({ name: "", ip: "", email: "", phone: "" });
		setModalOpen(true);
	};

	const onEdit = (item) => {
		setEditing(item);
		setForm({
			id: item.id,
			name: item.name,
			ip: item.ip,
			email: item.email,
			phone: item.phone,
		});
		setModalOpen(true);
	};

	const onDelete = (id) => {
		dispatch(
			setModal({
				title: t("delete") || "Delete",
				message: t("confirmDelete") || "Are you sure you want to delete?",
				variant: "danger",
				showCancel: true,
				confirmText: t("delete") || "Delete",
				cancelText: t("cancel") || "Cancel",
				onConfirm: () => confirmDelete(id),
			})
		);
	};

	const confirmDelete = async (id) => {
		const res = await deleteBlacklist({ dispatch, id });
		if (res.ok) {
			dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "success", message: t("deleteSuccess") || "Deleted successfully" } });
			refresh();
		} else {
			dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "error", message: res.error?.message || t("deleteFailed") || "Delete failed" } });
		}
	};

	const onSave = async (data) => {
		if (!data.name) {
			dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "warning", message: t("nameRequired") || "Name is required" } });
			return;
		}

		setSaving(true);
		const res = await createBlacklist({ dispatch, data });
		setSaving(false);
		if (res.ok) {
			dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "success", message: t("saveSuccess") || "Saved successfully" } });
			setModalOpen(false);
			refresh();
		} else {
			dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "error", message: res.error?.message || t("saveFailed") || "Save failed" } });
		}
	};

	const onPageChange = (p) => dispatch(setPage(p));
	const onPageSizeChange = (n) => {
		dispatch(setPageSize(n));
		dispatch(setPage(1));
	};

	const safeList = Array.isArray(list) ? list : [];

	return (
		<div className="p-6">
			<BlacklistFormModal open={modalOpen} initial={form} onClose={() => setModalOpen(false)} onSave={onSave} t={t} saving={saving} />

			<div className="bg-white rounded-2xl shadow p-4">
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-2">
						<FontAwesomeIcon icon={faBan} className="text-gray-400" />
						<h3 className="text-sm font-semibold text-gray-900">{t("blacklist") || "Blacklist"}</h3>
					</div>
					<button onClick={onAdd} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 transition-colors">
						<FontAwesomeIcon icon={faPlus} />
						{t("add") || "Add"}
					</button>
				</div>

				{loading ? (
					<div className="p-8 text-center text-gray-500">{t("loading") || "Loading..."}</div>
				) : (
					<div className="overflow-x-auto mt-3">
						<table className="min-w-full text-xs">
							<thead className="bg-gray-100">
								<tr>
									<th className="px-2 py-3 text-left font-medium text-gray-700">ID</th>
									<th className="px-2 py-3 text-left font-medium text-gray-700">{t("name") || "Name"}</th>
									<th className="px-2 py-3 text-left font-medium text-gray-700">{t("ipAddress") || "IP Address"}</th>
									<th className="px-2 py-3 text-left font-medium text-gray-700">{t("email") || "Email"}</th>
									<th className="px-2 py-3 text-left font-medium text-gray-700">{t("phone") || "Phone"}</th>
									<th className="px-2 py-3 text-left font-medium text-gray-700">{t("actions") || "Actions"}</th>
								</tr>
							</thead>
							<tbody>
								{safeList.map((item) => (
									<tr key={item.id} className="border-t hover:bg-gray-50 transition-colors">
										<td className="p-2 text-gray-600">{item.id}</td>
										<td className="p-2 font-medium text-gray-900">{item.name}</td>
										<td className="p-2 text-gray-500">{item.ip || "-"}</td>
										<td className="p-2 text-gray-500">{item.email || "-"}</td>
										<td className="p-2 text-gray-500">{item.phone || "-"}</td>
										<td className="p-2">
											<div className="flex items-center gap-3 text-gray-400">
												<button onClick={() => onEdit(item)} className="hover:text-blue-600 transition-colors" title={t("edit")}>
													<FontAwesomeIcon icon={faPen} className="w-3 h-3" />
												</button>
												<button onClick={() => onDelete(item.id)} className="hover:text-red-600 transition-colors" title={t("delete")}>
													<FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
												</button>
											</div>
										</td>
									</tr>
								))}
								{safeList.length === 0 && (
									<tr>
										<td colSpan="6" className="px-4 py-8 text-center text-gray-400">
											{t("noData") || "No Data"}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				)}

				<div className="mt-3">
					<Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />
				</div>
			</div>
		</div>
	);
}
