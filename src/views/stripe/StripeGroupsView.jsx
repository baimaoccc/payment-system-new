import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { addToast, setModal } from "../../store/slices/ui.js";
import { fetchStripeGroups, createOrUpdateStripeGroup, deleteStripeGroup } from "../../controllers/stripeGroupController.js";
import { fetchStripeAccountListAll } from "../../controllers/stripeController.js";
import { fetchUserListNII } from "../../controllers/usersController.js";
import { Pagination } from "../../components/common/Pagination.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faPen, faTrash, faTimes, faLayerGroup, faAlignLeft, faSearch, faSpinner, faCreditCard, faUser } from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";

const MobileGroupCard = ({ item, onEdit, onDelete, t }) => {
	const [expanded, setExpanded] = useState(false);

	return (
		<div className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 transition-all duration-200 cursor-pointer ${expanded ? "ring-1 ring-blue-100" : "hover:shadow-md"}`} onClick={() => setExpanded(!expanded)}>
			<div className="flex justify-between items-start mb-3">
				<div className="flex-1 min-w-0 mr-3">
					<div className="flex items-center gap-2 mb-1">
						<span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs font-mono shrink-0">#{item.id}</span>
						<h3 className="font-bold text-gray-900 line-clamp-1 break-all">{item.name}</h3>
					</div>
					<div className="flex items-center gap-1.5 text-xs text-gray-500">
						<FontAwesomeIcon icon={faUser} className="text-gray-400" />
						<span className="font-medium text-brand truncate">{item.username || item.user_id || "-"}</span>
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
							onDelete(item.id);
						}}
						className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
						title={t("delete")}>
						<FontAwesomeIcon icon={faTrash} size="sm" />
					</button>
				</div>
			</div>

			{item.remark && (
				<div className="bg-gray-50 rounded-lg p-2.5 mb-3 text-xs text-gray-600 leading-relaxed break-words">
					<span className="font-medium text-gray-500 mr-1">{t("remark")}:</span>
					{item.remark}
				</div>
			)}

			<div className="space-y-2">
				<div>
					<span className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">{t("stripeAccounts")}</span>
					<div className={`flex flex-wrap gap-1.5 transition-all duration-300 ease-in-out ${expanded ? "" : "max-h-[92px] overflow-hidden"}`}>
						{item.stripe_list && item.stripe_list.length > 0 ? (
							item.stripe_list.map((s, idx) => (
								<span key={idx} className="inline-flex items-center px-2 py-1 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
									<FontAwesomeIcon icon={faCreditCard} className="mr-1.5 opacity-60 text-[10px]" />
									{s.name || s.id}
								</span>
							))
						) : (
							<span className="text-xs text-gray-400 italic">{t("noData")}</span>
						)}
					</div>
					{!expanded && item.stripe_list && item.stripe_list.length > 0 && (
						<div className="flex justify-center mt-1">
							<span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{t("clickToExpand") || "..."}</span>
						</div>
					)}
				</div>

				<div className="pt-3 mt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
					<span>{t("createTime")}</span>
					<span className="font-mono">{item.createtime ? new Date(item.createtime * 1000).toLocaleString() : "-"}</span>
				</div>
			</div>
		</div>
	);
};

const DesktopGroupRow = ({ item, onEdit, onDelete, t }) => {
	const [expanded, setExpanded] = useState(false);

	return (
		<tr className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => setExpanded(!expanded)}>
			<td className="py-2 px-6 text-xs text-gray-500">#{item.id}</td>
			<td className="py-2 px-6 text-xs font-medium text-gray-900">{item.name}</td>
			<td className="py-2 px-6 text-xs text-brand italic font-bold">{item.username || item.user_id || "-"}</td>
			<td className="py-2 px-6 text-xs text-gray-500 max-w-xs" title={item.remark}>
				<div className={`line-clamp-3 ${expanded ? "line-clamp-none" : ""}`}>
					{item.remark || "-"}
				</div>
			</td>
			<td className="py-2 px-6 text-xs text-gray-500">
				<div className={`flex flex-wrap gap-1.5 transition-all duration-300 ease-in-out ${expanded ? "" : "max-h-[76px] overflow-hidden"}`} title={!expanded ? item.stripe_list?.map((s) => s.name || s.id).join(", ") : ""}>
					{item.stripe_list && item.stripe_list.length > 0
						? item.stripe_list.map((s, idx) => (
								<span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
									{s.name || s.id}
								</span>
						  ))
						: "-"}
				</div>
			</td>
			<td className="py-2 px-6 text-xs text-gray-500">{item.createtime ? new Date(item.createtime * 1000).toLocaleString() : "-"}</td>
			<td className="py-2 px-6 text-right">
				<div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
					<button onClick={() => onEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title={t("edit")}>
						<FontAwesomeIcon icon={faPen} />
					</button>
					<button onClick={() => onDelete(item.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title={t("delete")}>
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

function GroupFormModal({ open, initial, onClose, onSave, t, stripeOptions, currentUser, adminUsers }) {
	const dispatch = useDispatch();
	const [form, setForm] = useState({ name: "", remark: "", stripe_list: [], user_id: "" });
	const [saving, setSaving] = useState(false);
	const [currentStripeOptions, setCurrentStripeOptions] = useState([]);

	useEffect(() => {
		const fetchUserStripeAccounts = async () => {
			if (currentUser && Number(currentUser.juese_id) === 1 && form.user_id) {
				const res = await fetchStripeAccountListAll({ user_id: form.user_id });
				if (res.ok) {
					const options = (res.data || []).map((s) => ({
						value: s.id,
						label: `${s.comment || s.id} (${s.api_publishable_key ? "..." + s.api_publishable_key.slice(-4) : "No PK"})`,
					}));
					setCurrentStripeOptions(options);
				}
			} else {
				setCurrentStripeOptions(stripeOptions);
			}
		};

		if (open) {
			fetchUserStripeAccounts();
		}
	}, [form.user_id, currentUser, open, stripeOptions]);

	useEffect(() => {
		if (initial) {
			setForm({
				id: initial.id,
				name: initial.name || "",
				remark: initial.remark || "",
				stripe_list: initial.stripe_list ? initial.stripe_list.map((s) => ({ value: s.id, label: s.name || s.id })) : [],
				user_id: initial.user_id || "",
			});
		} else {
			setForm({ name: "", remark: "", stripe_list: [], user_id: currentUser?.juese_id === 1 ? "" : currentUser?.id || "" });
		}
	}, [initial, open, currentUser]);

	const userOptions = React.useMemo(() => {
		const options = adminUsers.map((user) => ({
			value: user.id,
			label: user.username || user.email || user.phone || String(user.id),
		}));

		// If editing and current user_id is not in options (maybe not an admin anymore or self), add it
		if (form.user_id && !options.find((o) => o.value === form.user_id)) {
			const label = initial && initial.user_id === form.user_id && initial.username ? initial.username : String(form.user_id);
			options.push({ value: form.user_id, label });
		}

		return options;
	}, [adminUsers, form.user_id, initial]);

	const handleSubmit = async () => {
		if (!form.name) return dispatch(addToast({ id: Date.now(), type: "error", message: t("nameRequired") }));

		setSaving(true);
		const payload = {
			...form,
			stripe_list: form.stripe_list.map((opt) => ({ id: opt.value, name: opt.label })),
		};
		await onSave(payload);
		setSaving(false);
	};

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
			<div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300 mx-2">
				<div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white z-10">
					<div>
						<h3 className="text-xl font-bold text-gray-900">{initial ? t("editGroup") : t("addGroup")}</h3>
					</div>
					<button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-50">
						<FontAwesomeIcon icon={faTimes} className="text-xl" />
					</button>
				</div>

				<div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
					<div className="grid grid-cols-1 gap-y-6">
						<InputRow icon={faLayerGroup} label={t("groupName")}>
							<input value={form.name} onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))} placeholder={t("enterGroupName")} className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-300 py-1" />
						</InputRow>

						{currentUser && Number(currentUser.juese_id) === 1 && (
							<InputRow icon={faUser} label={t("belongTo")} noBorder>
								<Select
									value={userOptions.find((o) => o.value === form.user_id)}
									onChange={(val) => setForm((v) => ({ ...v, user_id: val ? val.value : "" }))}
									options={userOptions}
									placeholder={t("selectUser")}
									className="w-full mt-1"
									isClearable
									styles={{
										control: (base, state) => ({
											...base,
											minHeight: 36,
											borderRadius: 8,
											borderColor: state.isFocused ? "#1E4DB7" : "#ECF0F2",
											boxShadow: state.isFocused ? "0 0 0 2px #1E4DB74D" : "none",
											"&:hover": { borderColor: "#1E4DB7" },
										}),
										menu: (base) => ({ ...base, borderRadius: 8, overflow: "hidden", zIndex: 9999 }),
									}}
								/>
							</InputRow>
						)}

						<InputRow icon={faAlignLeft} label={t("remark")}>
							<textarea value={form.remark} onChange={(e) => setForm((v) => ({ ...v, remark: e.target.value }))} placeholder={t("enterRemark")} className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-300 py-1 h-20 resize-none" />
						</InputRow>

						<InputRow icon={faCreditCard} label={t("stripeAccounts")} noBorder>
							<Select
								isMulti
								value={form.stripe_list}
								onChange={(val) => setForm((v) => ({ ...v, stripe_list: val }))}
								options={currentStripeOptions}
								placeholder={t("selectStripeAccounts")}
								className="w-full mt-1"
								styles={{
									control: (base, state) => ({
										...base,
										minHeight: 36,
										borderRadius: 8,
										borderColor: state.isFocused ? "#1E4DB7" : "#ECF0F2",
										boxShadow: state.isFocused ? "0 0 0 2px #1E4DB74D" : "none",
										"&:hover": { borderColor: "#1E4DB7" },
									}),
									menu: (base) => ({ ...base, borderRadius: 8, overflow: "hidden", zIndex: 9999 }),
									option: (base, state) => ({
										...base,
										fontSize: 13,
										backgroundColor: state.isFocused ? "#F3F5F9" : "#fff",
										color: "#11142D",
									}),
									multiValue: (base) => ({ ...base, backgroundColor: "#EFF6FF", borderRadius: 4 }),
									multiValueLabel: (base) => ({ ...base, color: "#1E4DB7", fontSize: 12 }),
									multiValueRemove: (base) => ({ ...base, color: "#1E4DB7", ":hover": { backgroundColor: "#DBEAFE", color: "#1E3A8A" } }),
									placeholder: (base) => ({ ...base, color: "#949DB2" }),
									dropdownIndicator: (base, state) => ({ ...base, color: state.isFocused ? "#1E4DB7" : "#949DB2" }),
									indicatorSeparator: (base) => ({ ...base, display: "none" }),
								}}
							/>
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

export default function StripeGroupsView() {
	const { t } = useI18n();
	const dispatch = useDispatch();
	const currentUser = useSelector((s) => s.auth.user);
	const [list, setList] = useState([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(20);
	const [modalOpen, setModalOpen] = useState(false);
	const [editingGroup, setEditingGroup] = useState(null);
	const [stripeOptions, setStripeOptions] = useState([]);
	const [adminUsers, setAdminUsers] = useState([]);

	// Cache stripe options to avoid redundant calls
	const stripeOptionsRef = React.useRef(null);

	// Load admin users for Super Admin
	useEffect(() => {
		if (currentUser && Number(currentUser.juese_id) === 1) {
			fetchUserListNII().then((res) => {
				if (res.ok) {
					console.log("Admin Users List:", res.data);
					// API is expected to return the list of admins directly
					setAdminUsers(res.data || []);
				}
			});
		}
	}, [currentUser]);

	const loadData = async () => {
		setLoading(true);
		const res = await fetchStripeGroups({ page, per_page: pageSize });
		setLoading(false);
		if (res.ok) {
			setList(res.data.list);
			setTotal(res.data.total);
		} else {
			dispatch(addToast({ id: Date.now(), type: "error", message: res.error?.message || t("loadFailed") }));
		}
	};

	const loadStripeAccounts = async () => {
		// Prevent redundant calls if already loaded
		// if (stripeOptionsRef.current && stripeOptionsRef.current.length > 0) {
		// 	setStripeOptions(stripeOptionsRef.current);
		// 	return;
		// }

		const res = await fetchStripeAccountListAll();
		if (res.ok) {
			console.log("Stripe Accounts Data:", res.data);
			const options = (res.data || []).map((s) => ({
				value: s.id,
				label: `${s.comment || s.id} (${s.api_publishable_key ? "..." + s.api_publishable_key.slice(-4) : "No PK"})`,
			}));
			stripeOptionsRef.current = options;
			setStripeOptions(options);
		}
	};

	useEffect(() => {
		loadData();
	}, [page, pageSize]);

	useEffect(() => {
		loadStripeAccounts();
	}, []);

	const handleSave = async (payload) => {
		const res = await createOrUpdateStripeGroup(payload);
		if (res.ok) {
			dispatch(addToast({ id: Date.now(), type: "success", message: t("saveSuccess") }));
			setModalOpen(false);
			loadData();
		} else {
			dispatch(addToast({ id: Date.now(), type: "error", message: res.error?.message || t("saveFailed") }));
		}
	};

	const handleDelete = (id) => {
		dispatch(
			setModal({
				title: t("delete"),
				message: t("confirmDelete"),
				variant: "danger",
				showCancel: true,
				confirmText: t("delete"),
				cancelText: t("cancel"),
				onConfirm: async () => {
					const res = await deleteStripeGroup({ id });
					if (res.ok) {
						dispatch(addToast({ id: Date.now(), type: "success", message: t("deleteSuccess") }));
						loadData();
					} else {
						dispatch(addToast({ id: Date.now(), type: "error", message: res.error?.message || t("deleteFailed") }));
					}
				},
			})
		);
	};

	return (
		<div className="p-4 md:p-6 max-w-[1600px] mx-auto">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">{t("accountGrouping")}</h1>
					<p className="text-sm text-gray-500 mt-1">{t("accountGroupingDesc")}</p>
				</div>
				<button
					onClick={() => {
						setEditingGroup(null);
						setModalOpen(true);
					}}
					className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2">
					<FontAwesomeIcon icon={faPlus} />
					{t("addGroup")}
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
						<MobileGroupCard
							key={item.id}
							item={item}
							onEdit={(item) => {
								setEditingGroup(item);
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
								<th className="py-2 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("name")}</th>
								<th className="py-2 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("belongTo")}</th>
								<th className="py-2 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("remark")}</th>
								<th className="py-2 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("stripeAccounts")}</th>
								<th className="py-2 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("createTime")}</th>
								<th className="py-2 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">{t("actions")}</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100 text-[12px]">
							{loading ? (
								<tr>
									<td colSpan="7" className="py-8 text-center text-gray-400">
										<FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
										{t("loading")}
									</td>
								</tr>
							) : list.length === 0 ? (
								<tr>
									<td colSpan="7" className="py-8 text-center text-gray-400">
										{t("noData")}
									</td>
								</tr>
							) : (
								list.map((item) => (
									<DesktopGroupRow
										key={item.id}
										item={item}
										onEdit={(item) => {
											setEditingGroup(item);
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

			<GroupFormModal open={modalOpen} initial={editingGroup} onClose={() => setModalOpen(false)} onSave={handleSave} t={t} stripeOptions={stripeOptions} currentUser={currentUser} adminUsers={adminUsers} />
		</div>
	);
}
