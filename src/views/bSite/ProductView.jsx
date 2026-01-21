import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { addToast, setModal } from "../../store/slices/ui.js";
import { fetchProductList, createOrUpdateProduct, deleteProduct, fetchAccountTypesAll, uploadProductExcel } from "../../controllers/bSiteProductController.js";
import { Pagination } from "../../components/common/Pagination.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faPen, faTrash, faSpinner, faAlignLeft, faLanguage, faLayerGroup, faSearch, faTimes, faDownload, faUpload } from "@fortawesome/free-solid-svg-icons";
import ReactSelect from "react-select";
import { Select } from "../../components/ui/Select.jsx";
import { API_BASE_URL, API_ACCOUNT_EXPORT_TEMPLATE } from "../../constants/api.js";

const MobileProductCard = ({ item, onEdit, onDelete, t }) => {
	const [expanded, setExpanded] = useState(false);

	return (
		<div className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 transition-all duration-200 cursor-pointer ${expanded ? "ring-1 ring-blue-100" : "hover:shadow-md"}`} onClick={() => setExpanded(!expanded)}>
			<div className="flex justify-between items-start mb-3">
				<div className="flex-1 min-w-0 mr-3">
					<div className="flex items-center gap-2 mb-1">
						<span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs font-mono shrink-0">#{item.id}</span>
						<h3 className="font-bold text-gray-900 line-clamp-1 break-all">{item.product_name}</h3>
					</div>
					{item.product_name_zh && <div className="text-xs text-gray-500 mb-1">{item.product_name_zh}</div>}
					{item.account_type_category_name && <div className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mb-1">{item.account_type_category_name}</div>}
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
							onDelete(item.id, item.product_name);
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

const DesktopProductRow = ({ item, onEdit, onDelete, t }) => {
	return (
		<tr className="hover:bg-gray-50/50 transition-colors">
			<td className="py-2 px-6 text-xs text-gray-500">#{item.id}</td>
			<td className="py-2 px-6 text-xs font-medium text-gray-900">{item.product_name}</td>
			<td className="py-2 px-6 text-xs text-gray-500">{item.product_name_zh || "-"}</td>
			<td className="py-2 px-6 text-xs text-gray-600">
				<span className="bg-gray-100 px-2 py-0.5 rounded-full">{item.account_type_category_name || "-"}</span>
			</td>
			<td className="py-2 px-6 text-xs text-gray-500">{item.updatetime ? new Date(item.updatetime * 1000).toLocaleString() : "-"}</td>
			<td className="py-2 px-6 text-right">
				<div className="flex items-center justify-end gap-2">
					<button onClick={() => onEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title={t("edit")}>
						<FontAwesomeIcon icon={faPen} />
					</button>
					<button onClick={() => onDelete(item.id, item.product_name)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title={t("delete")}>
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

function ProductFormModal({ open, initial, onClose, onSave, t }) {
	const dispatch = useDispatch();
	const [form, setForm] = useState({ product_name: "", product_name_zh: "", account_type_id: null });
	const [saving, setSaving] = useState(false);
	const [categories, setCategories] = useState([]);
	const [loadingCategories, setLoadingCategories] = useState(false);

	useEffect(() => {
		if (open) {
			loadCategories();
		}
	}, [open]);

	const loadCategories = async () => {
		setLoadingCategories(true);
		const res = await fetchAccountTypesAll();
		if (res.ok) {
			setCategories(res.data.list.map((c) => ({ value: c.id, label: c.category_name })));
		}
		setLoadingCategories(false);
	};

	useEffect(() => {
		if (initial) {
			setForm({
				id: initial.id,
				product_name: initial.product_name || "",
				product_name_zh: initial.product_name_cn || "", // Note: API returns _cn, update uses _zh
				account_type_id: initial.account_type_id || null,
			});
		} else {
			setForm({ product_name: "", product_name_zh: "", account_type_id: null });
		}
	}, [initial, open]);

	const handleSubmit = async () => {
		if (!form.product_name) return dispatch(addToast({ id: Date.now(), type: "error", message: t("isRequired") }));
		if (!form.account_type_id) return dispatch(addToast({ id: Date.now(), type: "error", message: t("pleaseSelect") }));

		setSaving(true);
		const payload = { ...form, lang: "zh" };

		const res = await createOrUpdateProduct(payload);

		setSaving(false);

		if (res.ok) {
			dispatch(addToast({ id: Date.now(), type: "success", message: t("saveSuccess") }));
			onSave();
			onClose();
		} else {
			dispatch(addToast({ id: Date.now(), type: "error", message: res.error?.message || t("saveFailed") }));
		}
	};

	const customStyles = {
		control: (base) => ({
			...base,
			border: "none",
			boxShadow: "none",
			backgroundColor: "transparent",
			minHeight: "36px",
			padding: 0,
		}),
		valueContainer: (base) => ({
			...base,
			padding: "0",
		}),
		input: (base) => ({
			...base,
			margin: 0,
			padding: 0,
		}),
		placeholder: (base) => ({
			...base,
			color: "#9ca3af",
		}),
		menu: (base) => ({
			...base,
			zIndex: 100,
		}),
	};

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
			<div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300 mx-2">
				<div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
					<h3 className="text-lg font-bold text-gray-900">{initial ? t("editProduct") : t("addProduct")}</h3>
					<button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
						<FontAwesomeIcon icon={faTimes} />
					</button>
				</div>

				<div className="p-6 space-y-6">
					<InputRow icon={faLayerGroup} label={t("productCategory")}>
						<ReactSelect value={categories.find((c) => c.value === form.account_type_id)} onChange={(opt) => setForm((v) => ({ ...v, account_type_id: opt?.value }))} options={categories} isLoading={loadingCategories} placeholder={t("selectCategory")} styles={customStyles} className="w-full hs-product-category-selector" classNamePrefix="react-select" />
					</InputRow>
					<InputRow icon={faAlignLeft} label={t("productName")}>
						<input type="text" value={form.product_name} onChange={(e) => setForm((v) => ({ ...v, product_name: e.target.value }))} placeholder={t("enterName")} className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-300 py-1" autoFocus />
					</InputRow>

					<InputRow icon={faLanguage} label={t("productNameZh")}>
						<input type="text" value={form.product_name_zh} onChange={(e) => setForm((v) => ({ ...v, product_name_zh: e.target.value }))} placeholder={t("enterName")} className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-300 py-1" />
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

export function ProductView() {
	const { t } = useI18n();
	const dispatch = useDispatch();
	const token = useSelector((s) => s.auth.token);
	const [list, setList] = useState([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(20);
	const [modalOpen, setModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState(null);
	const [searchName, setSearchName] = useState("");
	const [categories, setCategories] = useState([]);
	const [loadingCategories, setLoadingCategories] = useState(false);
	const [isExporting, setIsExporting] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const uploadInputRef = React.useRef(null);

	useEffect(() => {
		loadCategories();
	}, []);

	useEffect(() => {
		loadData();
	}, [page, pageSize, searchName]);

	const loadCategories = async () => {
		setLoadingCategories(true);
		const res = await fetchAccountTypesAll();
		if (res.ok) {
			setCategories(res.data.list.map((c) => ({ value: c.category_name, label: c.category_name })));
		}
		setLoadingCategories(false);
	};

	const loadData = async () => {
		setLoading(true);
		const res = await fetchProductList({ page, per_page: pageSize, category_name: searchName || null });
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

	const handleDownloadTemplate = () => {
		if (isExporting) return;
		setIsExporting(true);

		try {
			const params = new URLSearchParams();
			if (token) {
				params.append("token", token);
			}
			const url = `${API_BASE_URL}${API_ACCOUNT_EXPORT_TEMPLATE}?${params.toString()}`;
			window.open(url, "_blank");
		} catch (e) {
			console.error("Export error:", e);
			dispatch(addToast({ id: Date.now(), type: "error", message: t("exportFailed") || "导出失败" }));
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

				const res = await uploadProductExcel({ filename: file.name, filetype: file.type, filedata: base64 });
				if (!res.ok) throw new Error(res.error?.message || "Upload failed");

				dispatch(addToast({ id: Date.now(), type: "success", message: t("uploadSuccess") || "上传成功" }));
				loadData();
			} catch (error) {
				console.error("上传失败", error);
				dispatch(addToast({ id: Date.now(), type: "error", message: error.message || t("uploadFailed") || "上传失败" }));
			} finally {
				setIsUploading(false);
				if (uploadInputRef.current) uploadInputRef.current.value = "";
			}
		};
		reader.readAsDataURL(file);
	};

	const handleDelete = (id, name) => {
		dispatch(
			setModal({
				title: t("delete"),
				message: t("deleteProductConfirm").replace("{name}", name || id),
				variant: "danger",
				showCancel: true,
				confirmText: t("delete"),
				cancelText: t("cancel"),
				onConfirm: async () => {
					const res = await deleteProduct(id);
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
				<div className="flex items-center gap-4">
					<h1 className="text-2xl font-bold text-gray-900">{t("bSiteProduct")}</h1>
					<div className="w-48">
						<Select
							value={searchName}
							onChange={setSearchName}
							options={categories}
							placeholder={t("selectCategory") || "Select Category"}
							isClearable
							className="text-sm"
						/>
					</div>
				</div>
				<div className="flex flex-wrap gap-2">
					<input ref={uploadInputRef} type="file" accept=".xls,.xlsx" className="hidden" onChange={handleUploadTemplate} />
					<button onClick={handleDownloadTemplate} disabled={isExporting} className="text-xs px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
						{isExporting ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faDownload} />}
						{t("exportTemplate")}
					</button>
					<button
						onClick={() => {
							if (uploadInputRef.current) uploadInputRef.current.click();
						}}
						disabled={isUploading}
						className="text-xs px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
						{isUploading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faUpload} />}
						{t("importData")}
					</button>
					<button
						onClick={() => {
							setEditingItem(null);
							setModalOpen(true);
						}}
						className="text-xs px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2">
						<FontAwesomeIcon icon={faPlus} />
						{t("addProduct")}
					</button>
				</div>
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
						<MobileProductCard
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
								<th className="py-2 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("productName")}</th>
								<th className="py-2 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("productNameZh")}</th>
								<th className="py-2 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("productCategory")}</th>
								<th className="py-2 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("update")}</th>
								<th className="py-2 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">{t("actions")}</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100 text-[12px]">
							{loading ? (
								<tr>
									<td colSpan="5" className="py-8 text-center text-gray-400">
										<FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
										{t("loading")}
									</td>
								</tr>
							) : list.length === 0 ? (
								<tr>
									<td colSpan="5" className="py-8 text-center text-gray-400">
										{t("noData")}
									</td>
								</tr>
							) : (
								list.map((item) => (
									<DesktopProductRow
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

			<ProductFormModal open={modalOpen} initial={editingItem} onClose={() => setModalOpen(false)} onSave={handleSave} t={t} />
		</div>
	);
}
