import React, { useState, useEffect } from "react";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { fetchCountryTransferList, createOrUpdateCountryTransfer, deleteCountryTransfer } from "../../controllers/countryTransferController.js";
import { fetchCountryList } from "../../controllers/countryController.js";
import { Pagination } from "../../components/common/Pagination.jsx";
import { Select } from "../../components/ui/Select.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash, faTimes, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useDispatch } from "react-redux";
import { addToast } from "../../store/slices/ui.js";

// Simple Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
	if (!isOpen) return null;
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
			<div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 mx-4">
				<div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
					<h3 className="text-lg font-bold text-gray-900">{title}</h3>
					<button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
						<FontAwesomeIcon icon={faTimes} />
					</button>
				</div>
				<div className="p-6">{children}</div>
			</div>
		</div>
	);
};

export default function CountryTransferView() {
	const { t, lang } = useI18n();
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const [list, setList] = useState([]);
	const [pagination, setPagination] = useState({ page: 1, per_page: 20, total: 0 });
	const [countries, setCountries] = useState([]);

	// Modal states
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalMode, setModalMode] = useState("create"); // create or edit
	const [formData, setFormData] = useState({ id: null, country_code: "", time_country: "00:00:00" });
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		loadCountries();
		loadData();
	}, [pagination.page]);

	const loadCountries = async () => {
		const res = await fetchCountryList();
		if (res.ok) {
			setCountries(res.data);
		}
	};

	const loadData = async () => {
		setLoading(true);
		try {
			const res = await fetchCountryTransferList(pagination.page, pagination.per_page);
			if (res.ok) {
				// Ensure list is an array, handle potential different response structures
				const dataList = res.data?.list || [];
				const total = res.data?.total || 0;
				setList(dataList);
				setPagination((prev) => ({ ...prev, total: parseInt(total) || 0 }));
			} else {
				dispatch(addToast({ type: "error", message: res.error?.message || t("loadFailed") || "Failed to load list" }));
			}
		} catch (error) {
			console.error(error);
			dispatch(addToast({ type: "error", message: t("networkError") || "Network error" }));
		} finally {
			setLoading(false);
		}
	};

	const handleEdit = (item) => {
		setFormData({
			id: item.id,
			country_code: item.country_code,
			time_country: item.time_country || "00:00:00",
		});
		setModalMode("edit");
		setIsModalOpen(true);
	};

	const handleCreate = () => {
		setFormData({ id: null, country_code: "", time_country: "00:00:00" });
		setModalMode("create");
		setIsModalOpen(true);
	};

	const handleDelete = async (id) => {
		if (!window.confirm(t("confirmDelete") || "Are you sure?")) return;

		const res = await deleteCountryTransfer(id);
		if (res.ok) {
			dispatch(addToast({ type: "success", message: t("deleteSuccess") || "Deleted successfully" }));
			loadData();
		} else {
			dispatch(addToast({ type: "error", message: res.error?.message || t("deleteFailed") || "Delete failed" }));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!formData.country_code) {
			dispatch(addToast({ type: "error", message: t("pleaseSelectCountry") || "Please select a country" }));
			return;
		}

		setSubmitting(true);
		try {
			const res = await createOrUpdateCountryTransfer(formData);
			if (res.ok) {
				dispatch(addToast({ type: "success", message: modalMode === "create" ? t("createSuccess") || "Created successfully" : t("updateSuccess") || "Updated successfully" }));
				setIsModalOpen(false);
				loadData();
			} else {
				dispatch(addToast({ type: "error", message: res.error?.message || t("operationFailed") || "Operation failed" }));
			}
		} catch (error) {
			dispatch(addToast({ type: "error", message: t("networkError") || "Network error" }));
		} finally {
			setSubmitting(false);
		}
	};

	const getCountryInfo = (code) => {
		const country = countries.find((c) => c.alpha2 === code || c.code === code);
		if (!country) return { name: code, flag: "🏳️" };
		return {
			name: lang === "zh" ? country.name_cn || country.name : country.name_en || country.name,
			flag: country.flag || "🏳️",
		};
	};

	const countryOptions = countries.map((c) => ({
		value: c.alpha2,
		label: `${c.flag || "🏳️"} ${lang === "zh" ? c.name_cn || c.name : c.name_en || c.name} (${c.alpha2})`,
	}));

	return (
		<div className="p-6 max-w-[1600px] mx-auto">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold text-gray-900">{t("countryTransferManagement") || "Country Transfer Point"}</h1>
				<button onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm shadow-blue-200">
					<FontAwesomeIcon icon={faPlus} />
					{t("create") || "Add New"}
				</button>
			</div>

			<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-sm text-gray-600">
						<thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-semibold text-gray-500">
							<tr>
								<th className="px-6 py-4">{t("country") || "Country"}</th>
								<th className="px-6 py-4">{t("resetTime") || "Reset Time"}</th>
								<th className="px-6 py-4">{t("updateTime") || "Update Time"}</th>
								<th className="px-6 py-4 text-right">{t("actions") || "Actions"}</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{loading ? (
								<tr>
									<td colSpan="4" className="px-6 py-8 text-center text-gray-400">
										<FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
										{t("loading") || "Loading..."}
									</td>
								</tr>
							) : list.length === 0 ? (
								<tr>
									<td colSpan="4" className="px-6 py-8 text-center text-gray-400 italic">
										{t("noData") || "No data available"}
									</td>
								</tr>
							) : (
								list.map((item) => {
									const { name, flag } = getCountryInfo(item.country_code);
									return (
										<tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
											<td className="px-6 py-4">
												<div className="flex items-center gap-2">
													<span className="text-xl">{flag}</span>
													<span className="font-medium text-gray-900">{name}</span>
													<span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">{item.country_code}</span>
												</div>
											</td>
											<td className="px-6 py-4 font-mono text-gray-700">{item.time_country}</td>
											<td className="px-6 py-4 text-gray-500 text-xs">{item.updatetime ? new Date(item.updatetime * 1000).toLocaleString() : "-"}</td>
											<td className="px-6 py-4 text-right">
												<div className="flex items-center justify-end gap-2">
													<button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title={t("edit") || "Edit"}>
														<FontAwesomeIcon icon={faEdit} />
													</button>
													<button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title={t("delete") || "Delete"}>
														<FontAwesomeIcon icon={faTrash} />
													</button>
												</div>
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>

				{pagination.total > 0 && (
					<div className="px-6 py-4 border-t border-gray-100">
						<Pagination
							page={pagination.page}
							pageSize={pagination.per_page}
							total={pagination.total}
							onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
							onPageSizeChange={(ps) => setPagination((prev) => ({ ...prev, per_page: ps, page: 1 }))}
						/>
					</div>
				)}
			</div>

			<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === "create" ? t("createCountryTransfer") || "Add Transfer Point" : t("editCountryTransfer") || "Edit Transfer Point"}>
				<form onSubmit={handleSubmit} className="space-y-4 min-h-[350px]">
					<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">{t("country") || "Country"}</label>
							<Select 
							value={formData.country_code} 
							onChange={(val) => setFormData((prev) => ({ ...prev, country_code: val }))} 
							options={countryOptions} 
							placeholder={t("selectCountry") || "Select a country"} 
							className="w-full text-sm"
							isSearchable={true}
							menuPortalTarget={document.body}
						/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">{t("resetTime") || "Reset Time"}</label>
							<input type="time" step="1" value={formData.time_country} onChange={(e) => setFormData((prev) => ({ ...prev, time_country: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" required />
							<p className="mt-1 text-xs text-gray-500">{t("resetTimeDesc") || "Format: HH:MM:SS"}</p>
						</div>

					<div className="pt-4 flex gap-3">
						<button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
							{t("cancel") || "Cancel"}
						</button>
						<button type="submit" disabled={submitting} className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
							{submitting && <FontAwesomeIcon icon={faSpinner} spin />}
							{t("submit") || "Submit"}
						</button>
					</div>
				</form>
			</Modal>
		</div>
	);
}
