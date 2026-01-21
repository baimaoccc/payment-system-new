import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { addToast, setModal } from "../../store/slices/ui.js";
import { fetchAccountTypes, createOrUpdateAccountType, deleteAccountType } from "../../controllers/accountTypeController.js";
import { Pagination } from "../../components/common/Pagination.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faPen, faTrash, faSpinner, faAlignLeft, faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";

const MobileCategoryCard = ({ item, onEdit, onDelete, t }) => {
	const [expanded, setExpanded] = useState(false);

	return (
		<div className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 transition-all duration-200 cursor-pointer ${expanded ? "ring-1 ring-blue-100" : "hover:shadow-md"}`} onClick={() => setExpanded(!expanded)}>
			<div className="flex justify-between items-start mb-3">
				<div className="flex-1 min-w-0 mr-3">
					<div className="flex items-center gap-2 mb-1">
						<span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs font-mono shrink-0">#{item.id}</span>
						<h3 className="font-bold text-gray-900 line-clamp-1 break-all">{item.category_name}</h3>
					</div>
				</div>
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
							onDelete(item.id, item.category_name);
						}}
						className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
						title={t("delete")}>
						<FontAwesomeIcon icon={faTrash} size="sm" />
					</button>
				</div>
			</div>

			<div className="pt-3 mt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
				<span>{t("update")}</span>
				<span className="font-mono">{item.updatetime ? new Date(item.updatetime * 1000).toLocaleString() : "-"}</span>
			</div>
		</div>
	);
};

const DesktopCategoryRow = ({ item, onEdit, onDelete, t }) => {
	return (
		<tr className="hover:bg-gray-50/50 transition-colors">
			<td className="py-2 px-6 text-xs text-gray-500">#{item.id}</td>
			<td className="py-2 px-6 text-xs font-medium text-gray-900">{item.category_name}</td>
			<td className="py-2 px-6 text-xs text-gray-500">{item.updatetime ? new Date(item.updatetime * 1000).toLocaleString() : "-"}</td>
			<td className="py-2 px-6 text-right">
				<div className="flex items-center justify-end gap-2">
					<button onClick={() => onEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title={t("edit")}>
						<FontAwesomeIcon icon={faPen} />
					</button>
					<button onClick={() => onDelete(item.id, item.category_name)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title={t("delete")}>
						<FontAwesomeIcon icon={faTrash} />
					</button>
				</div>
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

function CategoryFormModal({ open, initial, onClose, onSave, t }) {
	const dispatch = useDispatch();
	const [form, setForm] = useState({ category_name: "" });
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (initial) {
			setForm({
				id: initial.id,
				category_name: initial.category_name || "",
			});
		} else {
			setForm({ category_name: "" });
		}
	}, [initial, open]);

	const handleSubmit = async () => {
		if (!form.category_name) return dispatch(addToast({ id: Date.now(), type: "error", message: t("isRequired") }));

		setSaving(true);
		const payload = { ...form };

		// If creating, we might not have ID, but update needs ID.
		// User API doc says setAccountType takes {category_name, lang}.
		// If editing, we probably need to pass ID.

		const res = await createOrUpdateAccountType(payload);

		console.group("CategoryFormModal");
		console.log("payload:", payload);
		console.log("res:", res);
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
			<div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300 mx-2">
				<div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white z-10">
					<h3 className="text-xs font-bold text-gray-900">{initial ? t("editCategory") : t("addCategory")}</h3>
					<button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-50">
						<FontAwesomeIcon icon={faTimes} className="text-xl" />
					</button>
				</div>

				<div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
					<div className="space-y-6">
						<InputRow icon={faAlignLeft} label={t("categoryName")}>
							<input type="text" value={form.category_name} onChange={(e) => setForm((v) => ({ ...v, category_name: e.target.value }))} placeholder={t("enterName")} className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-300 py-1" autoFocus />
						</InputRow>
					</div>
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

export function ProductCategoryView() {
	const { t } = useI18n();
	const dispatch = useDispatch();
	const [list, setList] = useState([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(20);
	const [modalOpen, setModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState(null);
	const [searchName, setSearchName] = useState("");

	useEffect(() => {
		loadData();
	}, [page, pageSize]);

	const loadData = async () => {
		setLoading(true);
		const res = await fetchAccountTypes({ page, per_page: pageSize, category_name: searchName || null });
		if (res.ok) {
			setList(res.data.list);
			setTotal(res.data.total);
		} else {
			dispatch(addToast({ id: Date.now(), type: "error", message: res.error?.message || t("loadFailed") }));
		}
		setLoading(false);
	};

	const handleSearch = (e) => {
		e.preventDefault();
		setPage(1);
		loadData();
	};

	const handleDelete = (id, name) => {
		dispatch(
			setModal({
				title: t("delete"),
				message: t("deleteCategoryConfirm").replace("{name}", name || id),
				variant: "danger",
				showCancel: true,
				confirmText: t("delete"),
				cancelText: t("cancel"),
				onConfirm: async () => {
					const res = await deleteAccountType(id);
					if (res.ok) {
						dispatch(addToast({ id: Date.now(), type: "success", message: t("deleteSuccess") }));
						loadData();
					} else {
						dispatch(addToast({ id: Date.now(), type: "error", message: res.error?.message || t("deleteFailed") }));
					}
				},
			}),
		);
	};

	const handleSave = () => {
		loadData();
	};

	return (
		<div className="p-4 md:p-6 max-w-[1600px] mx-auto">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">{t("productCategory")}</h1>
				</div>
				<button
					onClick={() => {
						setEditingItem(null);
						setModalOpen(true);
					}}
					className="text-xs w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2">
					<FontAwesomeIcon icon={faPlus} />
					{t("addCategory")}
				</button>
			</div>

			{/* Mobile/Tablet View (Cards) */}
			<div className="lg:hidden space-y-4">
				{loading ? (
					<div className="bg-white rounded-xl p-8 text-center text-gray-400 shadow-sm border border-gray-100">
						<FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
						{t("loading")}
					</div>
				) : list.length === 0 ? (
					<div className="bg-white rounded-xl p-8 text-center text-gray-400 shadow-sm border border-gray-100">{t("noData")}</div>
				) : (
					list.map((item) => (
						<MobileCategoryCard
							key={item.id}
							item={item}
							onEdit={(item) => {
								setEditingItem(item);
								setModalOpen(true);
							}}
							onDelete={handleDelete}
							t={t}
						/>
					))
				)}
			</div>

			{/* Desktop View (Table) */}
			<div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="bg-gray-50/50 border-b border-gray-100 text-left">
								<th className="py-2 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("id")}</th>
								<th className="py-2 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("categoryName")}</th>
								<th className="py-2 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("update")}</th>
								<th className="py-2 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">{t("actions")}</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100 text-[12px]">
							{loading ? (
								<tr>
									<td colSpan="4" className="py-8 text-center text-gray-400">
										<FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
										{t("loading")}
									</td>
								</tr>
							) : list.length === 0 ? (
								<tr>
									<td colSpan="4" className="py-8 text-center text-gray-400">
										{t("noData")}
									</td>
								</tr>
							) : (
								list.map((item) => (
									<DesktopCategoryRow
										key={item.id}
										item={item}
										onEdit={(item) => {
											setEditingItem(item);
											setModalOpen(true);
										}}
										onDelete={handleDelete}
										t={t}
									/>
								))
							)}
						</tbody>
					</table>
				</div>

				<div className="p-4 border-t border-gray-100">
					<Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={setPageSize} />
				</div>
			</div>

			<CategoryFormModal open={modalOpen} initial={editingItem} onClose={() => setModalOpen(false)} onSave={handleSave} t={t} />
		</div>
	);
}
