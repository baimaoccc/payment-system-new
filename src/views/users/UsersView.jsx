import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { setPage, setPageSize, setAllUsers } from "../../store/slices/users.js";
import { setModal } from "../../store/slices/ui.js";
import { fetchUsers, createUser, deleteUser, fetchRoles, fetchUserListN } from "../../controllers/usersController.js";
import { fetchPayGroupListN } from "../../controllers/stripeGroupController.js";
import { uploadFile } from "../../controllers/commonController.js";
import { getRoleInfo } from "../../utils/roleRender.js";
import { Select } from "../../components/ui/Select.jsx";
import { Pagination } from "../../components/common/Pagination.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faPen, faTrash, faTimes, faUser, faKey, faEnvelope, faPhone, faPaperPlane, faUsers, faShieldAlt, faCamera, faSpinner, faEye, faEyeSlash, faSitemap } from "@fortawesome/free-solid-svg-icons";

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

function UserFormModal({ open, initial, onClose, onSave, t, roles = [], currentUser, allUsers = [], saving }) {
	const [form, setForm] = useState(initial || { juese_id: 4, username: "", password: "", email: "", mobile: "", tgid: "", qunid: "", avatar: "", pid: "", group_list: null });
	const [uploading, setUploading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	useEffect(() => {
		setForm(initial || { juese_id: 4, username: "", password: "", email: "", mobile: "", tgid: "", qunid: "", avatar: "", pid: currentUser?.id || "" });
		setShowPassword(false);
	}, [initial, currentUser]);

	const save = () => onSave(form);

	const handleFileChange = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		setUploading(true);
		const res = await uploadFile(file);
		setUploading(false);

		if (res.ok) {
			const fullUrl = res.data?.data?.fullurl || res.data?.fullurl || res.data?.url || res.data;
			setForm((prev) => ({ ...prev, avatar: fullUrl }));
		} else {
			alert(t("uploadFailed") + ": " + (res.error?.message || "Unknown error"));
		}
	};

	const isEdit = !!initial?.id;

	// Filter roles based on current user permission
	// Super Admin (1): Can create all
	// Admin (4): Can create CS (5) and Advertiser (6)
	const availableRoles = React.useMemo(() => {
		if (!currentUser) return [];
		if (Number(currentUser.juese_id) === 1) return roles;
		if (Number(currentUser.juese_id) === 4) {
			return roles.filter((r) => [5, 6].includes(Number(r.id)));
		}
		return [];
	}, [roles, currentUser]);

	const roleOptions = (
		availableRoles.length > 0
			? availableRoles.map((r) => ({ value: r.id, label: r.title || r.name || r.desc || r.id }))
			: [
					{ value: 1, label: t("role_super_admin") },
					{ value: 4, label: t("role_admin") },
					{ value: 5, label: t("role_cs") },
					{ value: 6, label: t("role_adv") },
			  ]
	).map((opt) => ({
		...opt,
		isDisabled:
			(opt.value === 1 && (!isEdit || Number(initial?.juese_id) !== 1)) || // Super Admin: only editable if already Super Admin
			(opt.value === 4 && Number(currentUser?.juese_id) !== 1), // Admin: only selectable by Super Admin
	}));

	// Calculate Parent Options
	// If Super Admin: Can assign to Self (1) or any Admin (4)
	// If Admin: Can only assign to Self (4) - Logic handled by auto-setting pid, but maybe show readonly input?
	const parentOptions = React.useMemo(() => {
		if (!currentUser) return [];
		if (Number(currentUser.juese_id) !== 1) return []; // Admins don't need to select parent, it's always themselves

		// For Super Admin:
		// If creating Admin: Parent is Super Admin (Self)
		// If creating CS/Adv: Parent can be Super Admin (Self) or any Admin
		if (Number(form.juese_id) === 4) {
			return [{ value: currentUser.id, label: `${currentUser.username} (${t("role_super_admin")})` }];
		} else {
			// Include Self and all Admins
			const admins = allUsers.filter((u) => Number(u.juese_id) === 4);
			const opts = [{ value: currentUser.id, label: `${currentUser.username} (${t("role_super_admin")})` }, ...admins.map((u) => ({ value: u.id, label: `${u.username} (${t("role_admin")})` }))];
			return opts;
		}
	}, [currentUser, allUsers, form.juese_id, t]);

	// Auto-set pid for Admin users
	useEffect(() => {
		if (currentUser && Number(currentUser.juese_id) === 4 && !form.pid) {
			setForm((prev) => ({ ...prev, pid: currentUser.id }));
		}
	}, [currentUser, form.pid]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
			<div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300 mx-2">
				{/* Header */}
				<div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white z-10">
					<div>
						<h3 className="text-xl font-bold text-gray-900">{initial?.id ? t("editUser") : t("addUser")}</h3>
						<p className="text-sm text-gray-500 mt-1">{t("userDetailsHint")}</p>
					</div>
					<button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-50">
						<FontAwesomeIcon icon={faTimes} className="text-xl" />
					</button>
				</div>

				<div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
					{/* Avatar Upload */}
					<div className="flex flex-col items-center justify-center mb-8">
						<div className="relative group cursor-pointer">
							<div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:border-blue-500 transition-colors">
								{form.avatar ? <img src={form.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <FontAwesomeIcon icon={faUser} className="text-gray-300 text-3xl" />}
								{uploading && (
									<div className="absolute inset-0 bg-black/30 flex items-center justify-center">
										<FontAwesomeIcon icon={faSpinner} className="text-white animate-spin" />
									</div>
								)}
							</div>
							<div className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg transform translate-x-1 translate-y-1">
								<FontAwesomeIcon icon={faCamera} className="text-xs" />
							</div>
							<input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={uploading} />
						</div>
						<span className="text-xs text-gray-400 mt-2">{t("clickToUpload")}</span>
					</div>

					<SectionHeader title={t("basicInfo")} subtitle={t("basicInfoHint")} />
					<div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
						<InputRow icon={faShieldAlt} label={t("role")} noBorder>
							<Select value={form.juese_id} onChange={(val) => setForm((s) => ({ ...s, juese_id: Number(val), pid: "" }))} options={roleOptions} placeholder={t("selectRole")} className="w-full" />
						</InputRow>

						{/* Parent Selector - Only for Super Admin */}
						{currentUser && Number(currentUser.juese_id) === 1 && (
							<InputRow icon={faSitemap} label={t("belongTo")} noBorder>
								<Select value={form.pid} onChange={(val) => setForm((s) => ({ ...s, pid: val }))} options={parentOptions} placeholder={t("selectParent")} className="w-full" />
							</InputRow>
						)}

						<InputRow icon={faUser} label={t("username")}>
							<input value={form.username} onChange={(e) => setForm((v) => ({ ...v, username: e.target.value }))} placeholder={t("username")} className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-300 py-1" />
						</InputRow>

						<InputRow icon={faKey} label={t("password")}>
							<div className="flex items-center">
								<input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm((v) => ({ ...v, password: e.target.value }))} placeholder={t("password")} className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-300 py-1" />
								<button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600 focus:outline-none px-2">
									<FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
								</button>
							</div>
						</InputRow>

						<InputRow icon={faEnvelope} label={t("email")}>
							<input value={form.email} onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))} placeholder={t("email")} className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-300 py-1" />
						</InputRow>
					</div>

					<div className="mt-8 mb-6">
						<SectionHeader title={t("contactInfo")} subtitle={t("contactInfoHint")} />
						<div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
							<InputRow icon={faPhone} label={t("mobile")}>
								<input value={form.mobile} onChange={(e) => setForm((v) => ({ ...v, mobile: e.target.value }))} placeholder={t("mobile")} className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-300 py-1" />
							</InputRow>

							<InputRow icon={faPaperPlane} label={t("tgid")}>
								<input value={form.tgid} onChange={(e) => setForm((v) => ({ ...v, tgid: e.target.value }))} placeholder={t("tgid")} className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-300 py-1" />
							</InputRow>

							<InputRow icon={faUsers} label={t("qunid")}>
								<input value={form.qunid} onChange={(e) => setForm((v) => ({ ...v, qunid: e.target.value }))} placeholder={t("qunid")} className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-300 py-1" />
							</InputRow>
						</div>
					</div>
				</div>

				<div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
					<button type="button" onClick={onClose} disabled={saving} className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
						{t("cancel")}
					</button>
					<button onClick={save} disabled={saving} className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
						{saving && <FontAwesomeIcon icon={faSpinner} spin />}
						{t("save")}
					</button>
				</div>
			</div>
		</div>
	);
}

function AssignGroupModal({ open, user, currentUser, onClose, onSave, t }) {
	const [payGroupIds, setPayGroupIds] = useState([]);
	const [payGroupOptions, setPayGroupOptions] = useState([]);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (open && user) {
			let ids = [];
			let initialOpts = [];
			
			let groupList = user.group_list;
			// Handle case where group_list is a JSON string
			if (typeof groupList === 'string') {
				try {
					groupList = JSON.parse(groupList);
				} catch (e) {
					console.error("Failed to parse group_list", e);
					groupList = [];
				}
			}

			if (Array.isArray(groupList)) {
				// Ensure IDs are numbers for consistency
				ids = groupList.map(g => (typeof g === 'object' ? Number(g.id) : Number(g)));
				// Extract initial options from existing group_list to ensure they display correctly even if not in the fetched list
				initialOpts = groupList
					.filter(g => typeof g === 'object' && g.id)
					.map(g => ({ value: Number(g.id), label: g.name || `Group #${g.id}` }));
			} else if (user.pay_group_id) {
				ids = String(user.pay_group_id).split(",").map(Number).filter(n => !isNaN(n));
			}
			setPayGroupIds(ids);
			loadPayGroups(initialOpts);
		} else {
			setPayGroupIds([]);
			setPayGroupOptions([]);
		}
	}, [open, user]);

	const loadPayGroups = async (initialOpts = []) => {
		const roleId = Number(user.juese_id);
		const targetRoles = [1, 4, 6];

		if (targetRoles.includes(roleId)) {
			let targetUserId = null;

			// Logic:
			// 1. Admin (4) or Super Admin (1): Use their own ID (user.id) to fetch groups.
			// 2. Pitcher (6): Use Current Login User's ID (currentUser.id).
			if (roleId === 4 || roleId === 1) {
				targetUserId = user.id;
			} else if (roleId === 6) {
				targetUserId = currentUser?.id;
			}

			if (targetUserId) {
				const res = await fetchPayGroupListN({ user_id: targetUserId });
				if (res.ok) {
					const groups = Array.isArray(res.data) ? res.data : [];
					const apiOptions = groups.map((g) => ({ value: Number(g.id), label: g.name || `Group #${g.id}` }));
					
					// Merge initial options with API options (deduplicate by value)
					const mergedOptions = [...apiOptions];
					initialOpts.forEach(opt => {
						if (!mergedOptions.find(o => o.value === opt.value)) {
							mergedOptions.push(opt);
						}
					});
					
					setPayGroupOptions(mergedOptions);
				} else {
					// If fetch fails, at least show the initial options
					setPayGroupOptions(initialOpts);
				}
			} else {
				setPayGroupOptions(initialOpts);
			}
		} else {
			setPayGroupOptions(initialOpts);
		}
	};

	const handleSave = async () => {
		setSaving(true);
		// Backend expects group_list as an array of objects {id, name}
		const selectedGroups = payGroupIds.map((id) => {
			const option = payGroupOptions.find((opt) => opt.value === id);
			return { id: id, name: option ? option.label : "" };
		});
		await onSave({ ...user, group_list: selectedGroups });
		setSaving(false);
		onClose();
	};

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
			<div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
				<div className="flex items-center justify-between p-6 border-b border-gray-100">
					<div>
						<h2 className="text-xl font-bold text-gray-900">{t("assignPaymentGroup")}</h2>
						<p className="text-sm text-gray-500 mt-1">{t("assignGroupHint")}</p>
					</div>
					<button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100">
						<FontAwesomeIcon icon={faTimes} />
					</button>
				</div>

				<div className="p-6 space-y-4">
					<div className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
						<FontAwesomeIcon icon={faUser} />
						<span className="font-medium">{user?.username}</span>
						<span className="opacity-75">({getRoleInfo(user?.juese_id, t).label})</span>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">{t("paymentGroup")}</label>
						<Select
							isMulti
							value={payGroupIds}
							onChange={setPayGroupIds}
							options={payGroupOptions}
							placeholder={t("selectPaymentGroup")}
							className="w-full"
						/>
						{payGroupOptions.length === 0 && (
							<p className="text-xs text-orange-500 mt-1">
								{t("noGroupsFound")}
							</p>
						)}
					</div>
				</div>

				<div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
					<button onClick={onClose} disabled={saving} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
						{t("cancel")}
					</button>
					<button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2">
						{saving && <FontAwesomeIcon icon={faSpinner} spin />}
						{t("save")}
					</button>
				</div>
			</div>
		</div>
	);
}

const MobileUserCard = ({ user, onEdit, onDelete, onAssignGroup, t }) => {
	const roleInfo = getRoleInfo(user.juese_id, t);

	return (
		<div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
			<div className="flex justify-between items-start mb-3">
				<div className="flex items-center gap-3">
					<div style={{ backgroundImage: `url(${user.avatar || ""})`, backgroundSize: "100%", backgroundRepeat: "no-repeat" }} className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm shrink-0 border border-gray-100">
						{user.avatar ? "" : (user.username || "?").charAt(0).toUpperCase()}
					</div>
					<div>
						<div className="flex items-center gap-2">
							<h3 className="font-bold text-gray-900">{user.username}</h3>
							<span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs font-mono">#{user.id}</span>
						</div>
						<p className="text-xs text-gray-500">{user.email}</p>
					</div>
				</div>
				<span className={`inline-block px-2 py-1 rounded text-xs font-medium ${roleInfo.className}`}>{roleInfo.label}</span>
			</div>

			<div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-gray-500 mb-4">
				<div className="flex flex-col">
					<span className="text-gray-400 mb-0.5">{t("mobile")}</span>
					<span className="font-medium text-gray-700">{user.mobile || "-"}</span>
				</div>
				<div className="flex flex-col">
					<span className="text-gray-400 mb-0.5">{t("tgid")}</span>
					<span className="font-medium text-gray-700">{user.tgid || "-"}</span>
				</div>
				<div className="flex flex-col col-span-2">
					<span className="text-gray-400 mb-0.5">{t("qunid")}</span>
					<span className="font-medium text-gray-700 break-all">{user.qunid || "-"}</span>
				</div>
			</div>

			<div className="flex justify-end gap-2 pt-3 border-t border-gray-50">
				{[1, 4, 6].includes(Number(user.juese_id)) && (
					<button onClick={() => onAssignGroup(user)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors" title={t("assignGroup")}>
						<FontAwesomeIcon icon={faSitemap} size="sm" />
					</button>
				)}
				<button onClick={() => onEdit(user)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title={t("edit")}>
					<FontAwesomeIcon icon={faPen} size="sm" />
				</button>
				<button onClick={() => onDelete(user.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title={t("delete")}>
					<FontAwesomeIcon icon={faTrash} size="sm" />
				</button>
			</div>
		</div>
	);
};

export function UsersView() {
	const dispatch = useDispatch();
	const { t } = useI18n();
	const { list, loading, page, pageSize, total, currentUser, allUsers } = useSelector((s) => ({
		list: s.users.list,
		loading: s.users.loading,
		page: s.users.page,
		pageSize: s.users.pageSize,
		total: s.users.total,
		currentUser: s.auth.user,
		allUsers: s.users.allUsers,
	}));

	const [form, setForm] = useState({ juese_id: 4, username: "", password: "", email: "", mobile: "", tgid: "", qunid: "", avatar: "", pid: "", group_list: null });
	const [modalOpen, setModalOpen] = useState(false);
	const [assignGroupModalOpen, setAssignGroupModalOpen] = useState(false);
	const [assignTarget, setAssignTarget] = useState(null);
	const [saving, setSaving] = useState(false);
	const [editing, setEditing] = useState(null);
	const [roles, setRoles] = useState([]);

	const refresh = () => fetchUsers({ dispatch, page, per_page: pageSize });

	useEffect(() => {
		refresh();
	}, [dispatch, page, pageSize]);

	useEffect(() => {
		fetchRoles().then((res) => {
			if (res.ok && Array.isArray(res.data)) {
				setRoles(res.data);
			}
		});

		// Fetch all users for parent selector if not available or if current user is Super Admin
		if (currentUser && Number(currentUser.juese_id) === 1 && (!allUsers || allUsers.length === 0)) {
			fetchUserListN().then((res) => {
				if (res.ok) {
					dispatch(setAllUsers(res.data));
				}
			});
		}
	}, [currentUser, dispatch]);

	const onAdd = () => {
		setEditing(null);
		setForm({ juese_id: 4, username: "", password: "", email: "", mobile: "", tgid: "", qunid: "", pid: currentUser?.id || "", avatar: "", group_list: null });
		setModalOpen(true);
	};

	const onEdit = (user) => {
		setEditing(user);
		setForm({
			id: user.id,
			juese_id: Number(user.juese_id) || 1,
			username: user.username,
			password: user.password || "", // Password usually left blank on edit unless changing
			email: user.email,
			mobile: user.mobile,
			tgid: user.tgid,
			qunid: user.qunid,
			pid: user.pid || currentUser?.id || "",
			avatar: user.avatar,
			group_list: user.group_list || null,
			// pay_group_id handled in separate modal
		});
		setModalOpen(true);
	};

	const onAssignGroup = (user) => {
		setAssignTarget(user);
		setAssignGroupModalOpen(true);
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
		const res = await deleteUser({ dispatch, id });
		if (res.ok) {
			dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "success", message: t("deleteSuccess") } });
			dispatch(setAllUsers([])); // Clear cached user list to force refresh
			refresh();
		} else {
			dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "error", message: res.error?.message || t("deleteFailed") } });
		}
	};

	const onSave = async (data) => {
		// Validation
		if (!data.juese_id) {
			dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "warning", message: t("roleRequired") } });
			return;
		}
		if (!data.pid) {
			dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "warning", message: t("parentRequired") } });
			return;
		}
		if (!data.username) {
			dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "warning", message: t("usernameRequired") } });
			return;
		}
		if (!data.id && !data.password) {
			dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "warning", message: t("passwordRequired") } });
			return;
		}
		// if (!data.email) {
		// 	dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "warning", message: t("emailRequired") || "Email is required" } });
		// 	return;
		// }

		setSaving(true);
		const res = await createUser({ dispatch, user: data });
		setSaving(false);
		if (res.ok) {
			dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "success", message: t("saveSuccess") } });
			dispatch(setAllUsers([])); // Clear cached user list to force refresh
			setModalOpen(false);
			// Also close assign modal if open (though it manages its own close, refresh is needed)
			refresh();
		} else {
			dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "error", message: res.error?.message || t("saveFailed") } });
		}
	};

	const onPageChange = (p) => dispatch(setPage(p));
	const onPageSizeChange = (n) => {
		dispatch(setPageSize(n));
		dispatch(setPage(1));
	};

	const safeList = Array.isArray(list) ? list : [];

	return (
		<div className="p-4 md:p-6 max-w-[1600px] mx-auto">
			<UserFormModal open={modalOpen} initial={form} onClose={() => setModalOpen(false)} onSave={onSave} t={t} roles={roles} currentUser={currentUser} allUsers={allUsers} saving={saving} />
			<AssignGroupModal open={assignGroupModalOpen} user={assignTarget} currentUser={currentUser} onClose={() => setAssignGroupModalOpen(false)} onSave={onSave} t={t} />

			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">{t("users")}</h1>
				</div>
				<button
					onClick={onAdd}
					className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2">
					<FontAwesomeIcon icon={faPlus} />
					{t("addUser")}
				</button>
			</div>

			{/* Mobile/Tablet View (Cards) */}
			<div className="lg:hidden space-y-4">
				{loading ? (
					<div className="bg-white rounded-xl p-8 text-center text-gray-400 shadow-sm border border-gray-100">
						<FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
						{t("loading")}
					</div>
				) : safeList.length === 0 ? (
					<div className="bg-white rounded-xl p-8 text-center text-gray-400 shadow-sm border border-gray-100">
						{t("noData")}
					</div>
				) : (
					safeList.map((u) => <MobileUserCard key={u.id} user={u} onEdit={onEdit} onDelete={onDelete} onAssignGroup={onAssignGroup} t={t} />)
				)}
			</div>

			{/* Desktop View (Table) */}
			<div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
				{loading ? (
					<div className="p-8 text-center text-gray-500">{t("loading")}</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50/50 border-b border-gray-100 text-left">
								<tr>
									<th className="py-2 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
									<th className="py-2 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("username")}</th>
									<th className="py-2 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("role")}</th>
									<th className="py-2 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("mobile")}</th>
									<th className="py-2 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("tgid")}</th>
									<th className="py-2 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("qunid")}</th>
									<th className="py-2 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">{t("actions")}</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100 text-[12px]">
								{safeList.map((u) => (
									<tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
										<td className="py-2 px-6 text-xs text-gray-500">{u.id}</td>
										<td className="py-2 px-6">
											<div className="flex items-center gap-2">
												<div style={{ backgroundImage: `url(${u.avatar || ""})`, backgroundSize: "100%", backgroudRepeat: "no-repeat" }} className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs shrink-0 border border-gray-100">
													{u.avatar ? "" : (u.username || "?").charAt(0).toUpperCase()}
												</div>
												<div className="flex flex-col">
													<span className="font-medium text-gray-900">{u.username}</span>
													<span className="text-[10px] text-gray-400">{u.email}</span>
												</div>
											</div>
										</td>
										<td className="py-2 px-6">
											<span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${getRoleInfo(u.juese_id, t).className}`}>{getRoleInfo(u.juese_id, t).label}</span>
										</td>
										<td className="py-2 px-6 text-xs text-gray-500">{u.mobile || "-"}</td>
										<td className="py-2 px-6 text-xs text-gray-500">{u.tgid || "-"}</td>
										<td className="py-2 px-6 text-xs text-gray-500 max-w-xs truncate" title={u.qunid}>{u.qunid || "-"}</td>
										<td className="py-2 px-6 text-right">
											<div className="flex items-center justify-end gap-2">
												{[1, 4, 6].includes(Number(u.juese_id)) && (
													<button onClick={() => onAssignGroup(u)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title={t("assignGroup") || "Assign Group"}>
														<FontAwesomeIcon icon={faSitemap} />
													</button>
												)}
												<button onClick={() => onEdit(u)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title={t("edit")}>
													<FontAwesomeIcon icon={faPen} />
												</button>
												<button onClick={() => onDelete(u.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title={t("delete")}>
													<FontAwesomeIcon icon={faTrash} />
												</button>
											</div>
										</td>
									</tr>
								))}
								{safeList.length === 0 && (
									<tr>
										<td colSpan="7" className="py-8 text-center text-gray-400">
											{t("noData")}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				)}

				<div className="p-4 border-t border-gray-100">
					<Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />
				</div>
			</div>

			{/* Pagination for Mobile (outside table container) */}
			<div className="lg:hidden mt-4">
				<Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />
			</div>
		</div>
	);
}
