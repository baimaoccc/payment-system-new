import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { fetchRoles, createRole, deleteRole, getRole } from "../../controllers/rolesController.js";
import { Pagination } from "../../components/common/Pagination.jsx";
import { Select } from "../../components/ui/Select.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash, faTimes, faPlus, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { setModal } from "../../store/slices/ui.js";

const InputRow = ({ label, children, className = "" }) => (
	<div className={`flex flex-col gap-1 ${className}`}>
		<label className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</label>
		<div className="border-b border-gray-200 focus-within:border-blue-600 transition-colors py-1">{children}</div>
	</div>
);

function RoleFormModal({ open, initial, onClose, onSave, t, saving }) {
	const [form, setForm] = useState(initial || { name: "" });

	useEffect(() => {
		setForm(initial || { name: "" });
	}, [initial]);

	if (!open) return null;

	const save = () => onSave(form);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
			<div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
				<div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white z-10">
					<h3 className="text-lg font-bold text-gray-900">{initial?.id ? t("editRole") || "Edit Role" : t("addRole") || "Add Role"}</h3>
					<button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-50">
						<FontAwesomeIcon icon={faTimes} />
					</button>
				</div>
				<div className="p-6 space-y-4">
					<InputRow label={t("roleName") || "Role Name"}>
						<input value={form.name || ""} onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))} placeholder={t("roleName") || "Role Name"} className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-300" />
					</InputRow>
					<InputRow label={t("status") || "Status"}>
						<Select
							value={form.status || "normal"}
							onChange={(val) => setForm((v) => ({ ...v, status: val }))}
							options={[
								{ value: "normal", label: t("status_active") || "Active" },
								{ value: "hidden", label: t("status_inactive") || "Inactive" },
							]}
						/>
					</InputRow>
				</div>
				<div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
					<button onClick={onClose} disabled={saving} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
						{t("cancel")}
					</button>
					<button onClick={save} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
						{saving && <FontAwesomeIcon icon={faSpinner} spin />}
						{t("save")}
					</button>
				</div>
			</div>
		</div>
	);
}

export function RolesView() {
	const dispatch = useDispatch();
	const { t } = useI18n();
	const [list, setList] = useState([]);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(20);
	const [total, setTotal] = useState(0);
	const [modalOpen, setModalOpen] = useState(false);
	const [editing, setEditing] = useState(null);

	const refresh = async () => {
		setLoading(true);
		const res = await fetchRoles({ page, per_page: pageSize });
		if (res.ok) {
			setList(res.data.list);
			setTotal(res.data.total);
		} else {
			dispatch({ type: "ui/addToast", payload: { type: "error", message: res.error?.message || t("fetchFailed") } });
		}
		setLoading(false);
	};

	useEffect(() => {
		refresh();
	}, [page, pageSize]);

	const onAdd = () => {
		setEditing(null);
		setModalOpen(true);
	};

	const onEdit = async (item) => {
		setLoading(true);
		const res = await getRole({ id: item.id });
		setLoading(false);
		if (res.ok) {
			setEditing(res.data);
		} else {
			setEditing(item);
			dispatch({ type: "ui/addToast", payload: { type: "warning", message: t("fetchDetailFailed") || "Could not fetch full details, using list data." } });
		}
		setModalOpen(true);
	};

	const onDelete = (id) => {
		dispatch(
			setModal({
				title: t("delete"),
				message: t("confirmDelete"),
				variant: "danger",
				showCancel: true,
				onConfirm: async () => {
					const res = await deleteRole({ id });
					if (res.ok) {
						dispatch({ type: "ui/addToast", payload: { type: "success", message: t("deleteSuccess") } });
						refresh();
					} else {
						dispatch({ type: "ui/addToast", payload: { type: "error", message: res.error?.message || t("deleteFailed") } });
					}
				},
			})
		);
	};

	const onSave = async (data) => {
		setSaving(true);
		const res = await createRole(data);
		setSaving(false);
		if (res.ok) {
			dispatch({ type: "ui/addToast", payload: { type: "success", message: t("saveSuccess") } });
			setModalOpen(false);
			refresh();
		} else {
			dispatch({ type: "ui/addToast", payload: { type: "error", message: res.error?.message || t("saveFailed") } });
		}
	};

	const formatDate = (timestamp) => {
		if (!timestamp) return "-";
		return new Date(timestamp * 1000).toLocaleString();
	};

	return (
		<div className="p-6 animate-in fade-in duration-300">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900">{t("roleManagement") || "Role Management"}</h1>
				<button onClick={onAdd} className="bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors flex items-center gap-2 shadow-sm">
					<FontAwesomeIcon icon={faPlus} />
					{t("addRole") || "Add Role"}
				</button>
			</div>

			<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-sm text-gray-600">
						<thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-semibold text-gray-500">
							<tr>
								<th className="px-6 py-4">ID</th>
								<th className="px-6 py-4">{t("roleName") || "Role Name"}</th>
								<th className="px-6 py-4">{t("status") || "Status"}</th>
								<th className="px-6 py-4">{t("createTime") || "Create Time"}</th>
								<th className="px-6 py-4 text-right">{t("actions")}</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-50">
							{loading && list.length === 0 ? (
								<tr>
									<td colSpan="5" className="px-6 py-8 text-center text-gray-400">
										{t("loading")}
									</td>
								</tr>
							) : list.length === 0 ? (
								<tr>
									<td colSpan="5" className="px-6 py-8 text-center text-gray-400">
										{t("noData")}
									</td>
								</tr>
							) : (
								list.map((item) => (
									<tr key={item.id} className="hover:bg-gray-50 transition-colors">
										<td className="px-6 py-4 font-mono text-xs">{item.id}</td>
										<td className="px-6 py-4 font-medium text-gray-900">{item.name || item.title || "-"}</td>
										<td className="px-6 py-4">
											<span className={`px-2 py-0.5 rounded text-xs ${item.status === "normal" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>{item.status === "normal" ? t("status_active") || "Active" : t("status_inactive") || "Inactive"}</span>
										</td>
										<td className="px-6 py-4 text-gray-500 text-xs">{formatDate(item.createtime)}</td>
										<td className="px-6 py-4 text-right space-x-2">
											<button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-800 p-1">
												<FontAwesomeIcon icon={faPen} />
											</button>
											<button onClick={() => onDelete(item.id)} className="text-red-400 hover:text-red-600 p-1">
												<FontAwesomeIcon icon={faTrash} />
											</button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
				<div className="px-6 py-4 border-t border-gray-100">
					<Pagination current={page} total={total} pageSize={pageSize} onChange={setPage} onPageSizeChange={setPageSize} />
				</div>
			</div>

			<RoleFormModal open={modalOpen} initial={editing} onClose={() => setModalOpen(false)} onSave={onSave} t={t} />
		</div>
	);
}
