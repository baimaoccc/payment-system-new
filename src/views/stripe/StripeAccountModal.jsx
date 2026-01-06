import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToast } from "../../store/slices/ui.js";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { createStripeAccount, updateStripeAccount } from "../../controllers/stripeController.js";
import { fetchCountryGroupsN } from "../../controllers/countryController.js";
import { fetchUserListNII } from "../../controllers/usersController.js";
import { getPaymentTypeOptions } from "../../utils/paymentUtils.js";
import { getStripeAccountStatusOptions, StripeAccountStatus } from "../../utils/stripeStatusUtils.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup, faToggleOn, faCommentAlt, faGlobe, faKey, faShieldAlt, faMoneyBillWave, faShoppingCart, faCreditCard, faAlignLeft, faGlobeAmericas, faTimes, faCheck, faSearch, faUser, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { Select } from "../../components/ui/Select.jsx";

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

const MultiSelect = ({ options, value, onChange, placeholder, disabled }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [search, setSearch] = useState("");
	const wrapperRef = useRef(null);

	useEffect(() => {
		function handleClickOutside(event) {
			if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [wrapperRef]);

	// Value is comma separated string
	const selectedValues = value
		? String(value)
				.split(",")
				.map((v) => v.trim())
				.filter(Boolean)
		: [];

	const handleSelect = (code) => {
		let newValues;
		if (selectedValues.includes(code)) {
			newValues = selectedValues.filter((v) => v !== code);
		} else {
			newValues = [...selectedValues, code];
		}
		onChange(newValues.join(","));
	};

	const removeTag = (e, code) => {
		e.stopPropagation();
		if (disabled) return;
		const newValues = selectedValues.filter((v) => v !== code);
		onChange(newValues.join(","));
	};

	const filteredOptions = options.filter((opt) => opt.name.toLowerCase().includes(search.toLowerCase()) || opt.code.toLowerCase().includes(search.toLowerCase()));

	return (
		<div className={`relative ${disabled ? "opacity-70" : ""}`} ref={wrapperRef}>
			<div className={`w-full min-h-[28px] flex flex-wrap gap-1.5 ${disabled ? "cursor-default" : "cursor-pointer"}`} onClick={() => !disabled && setIsOpen(!isOpen)}>
				{selectedValues.length === 0 && <span className="text-gray-300 py-1 text-sm">{placeholder}</span>}
				{selectedValues.map((code) => {
					const country = options.find((o) => o.code === code);
					return (
						<span key={code} className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded text-xs flex items-center gap-1">
							<span className="font-medium">{code}</span>
							{country && <span className="text-blue-400 max-w-[60px] truncate">{country.name}</span>}
							{!disabled && (
								<button type="button" onClick={(e) => removeTag(e, code)} className="ml-0.5 hover:text-blue-900 focus:outline-none">
									<FontAwesomeIcon icon={faTimes} className="text-[10px]" />
								</button>
							)}
						</span>
					);
				})}
			</div>

			{isOpen && !disabled && (
				<div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 flex flex-col animate-in fade-in zoom-in-95 duration-100">
					<div className="p-2 border-b border-gray-100 bg-gray-50/50">
						<div className="relative">
							<FontAwesomeIcon icon={faSearch} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
							<input type="text" value={search} onClick={(e) => e.stopPropagation()} onChange={(e) => setSearch(e.target.value)} placeholder="Search countries..." className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" autoFocus />
						</div>
					</div>
					<div className="overflow-y-auto flex-1 p-1">
						{filteredOptions.length === 0 ? (
							<div className="p-3 text-xs text-gray-400 text-center">No countries found</div>
						) : (
							filteredOptions.map((opt) => {
								const isSelected = selectedValues.includes(opt.code);
								return (
									<div key={opt.code} onClick={() => handleSelect(opt.code)} className={`px-3 py-2 text-xs rounded-md cursor-pointer flex items-center justify-between transition-colors ${isSelected ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}>
										<div className="flex items-center gap-2">
											<span className="w-6 font-mono text-gray-500">{opt.code}</span>
											<span>{opt.name}</span>
										</div>
										{isSelected && <FontAwesomeIcon icon={faCheck} className="text-blue-600" />}
									</div>
								);
							})
						)}
					</div>
				</div>
			)}
		</div>
	);
};

const SectionHeader = ({ title, subtitle }) => (
	<div className="mb-6 mt-2">
		<h4 className="text-base font-bold text-gray-900">{title}</h4>
		{subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
	</div>
);

export function StripeAccountModal({ isOpen, onClose, onSuccess, initialData = null, readOnly = false }) {
	const { t, lang } = useI18n();
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [groups, setGroups] = useState([]);
	const [adminUsers, setAdminUsers] = useState([]);

	const currentUser = useSelector((state) => state.auth.user);
	const isSuperAdmin = currentUser?.juese_id === 1;

	// Cache for admin users to avoid redundant calls
	const adminUsersRef = useRef(null);

	const paymentTypeOptions = getPaymentTypeOptions(t);
	const statusOptions = getStripeAccountStatusOptions(t).filter((opt) => {
		// Always allow Active (1) and Inactive (0)
		if (opt.value === StripeAccountStatus.ACTIVE || opt.value === StripeAccountStatus.INACTIVE) {
			return true;
		}
		// If editing, allow the current status so it displays correctly
		if (initialData && opt.value === initialData.status) {
			return true;
		}
		return false;
	});

	const [formData, setFormData] = useState({
		status: 1,
		group_id: "",
		comment: "",
		api_key: "",
		api_publishable_key: "",
		endpoint_secret: "",
		c_site_url: "",
		max_money: "",
		max_order: "",
		description: "",
		maximum_purchase_amount: "",
		white_list: "",
		country_group: "",
		level: "",
		type: 1,
		user_id: null,
		paymentType: 0,
	});

	useEffect(() => {
		loadGroups();
		if (isSuperAdmin) {
			if (adminUsersRef.current && adminUsersRef.current.length > 0) {
				setAdminUsers(adminUsersRef.current);
			} else {
				fetchUserListNII().then((res) => {
					if (res.ok) {
						// The API returns { data: { list: [...] } } or { data: [...] } depending on the implementation
						// Based on previous context, fetchUserListNII returns data.data.list
						const users = res.data.list || res.data || [];
						console.log("StripeAccountModal: fetched admin users", users);
						adminUsersRef.current = users;
						setAdminUsers(users);
					}
				});
			}
		}
	}, [isSuperAdmin]);

	const loadGroups = async () => {
		const res = await fetchCountryGroupsN();
		if (res.ok && res.data && Array.isArray(res.data.list)) {
			const mapped = res.data.list.map((g) => ({
				code: String(g.id),
				name: g.name,
				countries: g.fz_json,
			}));
			setGroups(mapped);
		}
	};

	useEffect(() => {
		if (isOpen) {
			if (initialData) {
				// Populate form with initial data
				// Note: If initialData doesn't have country_group, we can't easily reverse engineer it from white_list countries.
				// User will need to re-select groups if they are missing.

				setFormData({
					id: initialData.id,
					status: initialData.status !== undefined ? initialData.status : 1,
					group_id: initialData.group_id || "",
					comment: initialData.comment || "",
					api_key: initialData.api_key || "",
					api_publishable_key: initialData.api_publishable_key || "",
					endpoint_secret: initialData.endpoint_secret || "",
					c_site_url: initialData.c_site_url || "",
					max_money: initialData.max_money || "",
					max_order: initialData.max_order || "",
					description: initialData.description || "",
					maximum_purchase_amount: initialData.maximum_purchase_amount || "",
					white_list: "", // We don't use this for display anymore
					country_group: initialData.country_group ? String(initialData.country_group) : "",
					level: initialData.level !== undefined ? initialData.level : "",
					type: initialData.type !== undefined ? initialData.type : 1,
					user_id: initialData.user_id || null,
					paymentType: initialData.paymentType || 0,
				});
			} else {
				// Reset form
				setFormData({
					status: 1,
					group_id: "",
					comment: "",
					api_key: "",
					api_publishable_key: "",
					endpoint_secret: "",
					c_site_url: "",
					max_money: "",
					max_order: "",
					description: "",
					maximum_purchase_amount: "",
					white_list: "",
					country_group: "",
					level: "",
					type: 1,
					user_id: null,
					paymentType: 0,
				});
			}
			setError(null);
		}
	}, [isOpen, initialData]);

	const userOptions = React.useMemo(() => {
		const options = adminUsers.map((user) => ({
			value: user.id,
			label: user.username || user.email || user.phone || String(user.id),
		}));

		if (formData.user_id && !options.find((o) => o.value === formData.user_id)) {
			// If initialData has the username, use it, otherwise use ID
			const label = initialData && initialData.user_id === formData.user_id && initialData.username ? initialData.username : String(formData.user_id);
			options.push({ value: formData.user_id, label });
		}

		return options;
	}, [adminUsers, formData.user_id, initialData]);

	if (!isOpen) return null;

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleCountryGroupChange = (value) => {
		setFormData((prev) => ({ ...prev, country_group: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		// Basic validation for all fields except group_id and white_list
		const requiredFields = [
			{ key: "comment", label: t("st_comment") || "Comment" },
			{ key: "c_site_url", label: t("st_c_site_url") || "Site URL" },
			{ key: "level", label: t("st_level") || "Level" },
			{ key: "type", label: t("st_type") || "Type" },
			{ key: "api_publishable_key", label: t("st_pk") || "Publishable Key" },
			{ key: "endpoint_secret", label: t("st_sk") || "Secret Key" },
			{ key: "api_key", label: t("st_endpoint_secret") || "Endpoint Secret" },
			{ key: "max_money", label: t("st_max_money") || "Max Money" },
			{ key: "max_order", label: t("st_max_order") || "Max Order" },
			{ key: "maximum_purchase_amount", label: t("st_max_purchase") || "Max Purchase Amount" },
			{ key: "paymentType", label: t("paymentType") || "Payment Type" },
		];

		if (isSuperAdmin) {
			requiredFields.push({ key: "user_id", label: t("accountOwnership") || "User" });
		}

		for (const field of requiredFields) {
			const value = formData[field.key];
			if (value === "" || value === null || value === undefined) {
				setLoading(false);
				const errorMsg = `${field.label} ${t("isRequired")}`;
				setError(errorMsg);
				dispatch(addToast({ id: Date.now(), type: "error", message: errorMsg }));
				return;
			}
		}

		// Process whitelist from selected groups
		let white_list_array = [];
		if (formData.country_group) {
			const groupIds = formData.country_group.split(",");
			const allCountries = new Set();

			groupIds.forEach((gid) => {
				const group = groups.find((g) => g.code === gid);
				if (group && Array.isArray(group.countries)) {
					group.countries.forEach((c) => {
						if (c.alpha2) allCountries.add(c.alpha2);
						else if (c.code) allCountries.add(c.code);
					});
				}
			});

			white_list_array = Array.from(allCountries).map((code) => ({ country_code: code }));
		}

		const payload = {
			...formData,
			white_list: white_list_array,
		};

		// Clean up fields
		if (payload.c_site_url) payload.c_site_url = payload.c_site_url.trim();

		let res;
		if (initialData) {
			res = await updateStripeAccount(payload);
		} else {
			res = await createStripeAccount(payload);
		}

		setLoading(false);

		if (res.ok) {
			dispatch(addToast({ id: Date.now(), type: "success", message: t("saveSuccess") }));
			onSuccess();
			onClose();
		} else {
			const errorMsg = res.error?.message || t("saveFailed");
			dispatch(addToast({ id: Date.now(), type: "error", message: errorMsg }));
			setError(errorMsg);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
			<div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300 mx-2">
				{/* Header */}
				<div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white z-10">
					<div>
						<h3 className="text-xl font-bold text-gray-900">{readOnly ? t("details") : initialData ? t("st_edit") : t("st_add")}</h3>
						<p className="text-sm text-gray-500 mt-1">{readOnly ? t("st_modal_desc_view") : t("st_modal_desc_edit")}</p>
					</div>
					<button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-50">
						<FontAwesomeIcon icon={faTimes} className="text-xl" />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
					{error && (
						<div className="mb-6 p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 flex items-center gap-3">
							<FontAwesomeIcon icon={faShieldAlt} />
							{error}
						</div>
					)}

					{/* Section 1: Basic Info */}
					<div className="mb-10">
						<SectionHeader title={t("st_info_title")} subtitle={t("st_info_subtitle")} />
						<div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
							<InputRow icon={faToggleOn} label={t("st_status")} className="md:col-span-1" noBorder>
								<Select value={formData.status} onChange={(val) => handleChange({ target: { name: "status", value: val } })} options={statusOptions} placeholder={t("selectStatus") || "Select Status"} isDisabled={readOnly} className="w-full" />
							</InputRow>

							{isSuperAdmin && (
								<InputRow icon={faUser} label={t("accountOwnership")} className="md:col-span-1" noBorder>
									<Select value={formData.user_id} onChange={(val) => setFormData((prev) => ({ ...prev, user_id: val }))} options={userOptions} placeholder={t("selectUser") || "Select User"} isDisabled={readOnly} className="w-full" />
								</InputRow>
							)}

							<InputRow icon={faCommentAlt} label={t("st_comment")} className="md:col-span-1">
								<input type="text" name="comment" value={formData.comment} onChange={handleChange} className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-300 py-1" placeholder={t("commentPlaceholder")} disabled={readOnly} />
							</InputRow>

							<InputRow icon={faCreditCard} label={t("paymentType")} className="md:col-span-1" noBorder>
								<Select
									value={formData.paymentType}
									onChange={(val) => setFormData((prev) => ({ ...prev, paymentType: val }))}
									options={paymentTypeOptions.map((option) => ({
										value: option.value,
										label: option.label,
									}))}
									placeholder={t("selectPaymentType") || "Select Payment Type"}
									isDisabled={readOnly}
									className="w-full"
								/>
							</InputRow>

							<InputRow icon={faGlobe} label={t("st_c_site_url")} className="md:col-span-2">
								<input type="text" name="c_site_url" value={formData.c_site_url} onChange={handleChange} className="w-full outline-none bg-transparent text-blue-600 placeholder-gray-300 py-1 font-medium" placeholder="https://example.com" disabled={readOnly} />
							</InputRow>

							<InputRow icon={faLayerGroup} label={t("st_level") || "Level"}>
								<input type="number" name="level" value={formData.level} onChange={handleChange} className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-300 py-1" placeholder="e.g. 1" disabled={readOnly} />
							</InputRow>

							<InputRow icon={faShieldAlt} label={t("st_type") || "Type"} noBorder>
								<Select
									value={formData.type}
									onChange={(val) => setFormData((prev) => ({ ...prev, type: val }))}
									options={[
										{ value: 1, label: t("stTypeNormal") || "Normal" },
										{ value: 0, label: t("stTypePhishing") || "Phishing" },
									]}
									isDisabled={readOnly}
									className="w-full"
								/>
							</InputRow>
						</div>
					</div>

					{/* Section 2: API Keys */}
					<div className="mb-10">
						<SectionHeader title={t("st_api_title")} subtitle={t("st_api_subtitle")} />
						<div className="p-6">
							<InputRow icon={faKey} label={t("st_pk")}>
								<input type="text" name="api_publishable_key" value={formData.api_publishable_key} onChange={handleChange} className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-300 py-1 font-mono text-sm" placeholder="pk_test_..." disabled={readOnly} />
							</InputRow>

							<InputRow icon={faShieldAlt} label={t("st_sk")}>
								<input type="text" name="endpoint_secret" value={formData.endpoint_secret} onChange={handleChange} className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-300 py-1 font-mono text-sm" placeholder="sk_test_..." disabled={readOnly} />
							</InputRow>

							<InputRow icon={faKey} label={t("st_endpoint_secret")}>
								<input type="text" name="api_key" value={formData.api_key} onChange={handleChange} className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-300 py-1 font-mono text-sm" placeholder="whsec_..." disabled={readOnly} />
							</InputRow>
						</div>
					</div>

					{/* Section 3: Limits & Risk */}
					<div className="mb-6">
						<SectionHeader title={t("st_risk_title")} subtitle={t("st_risk_subtitle")} />
						<div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
							<InputRow icon={faMoneyBillWave} label={t("st_max_money")}>
								<input type="number" name="max_money" value={formData.max_money} onChange={handleChange} className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-300 py-1" placeholder="0.00" disabled={readOnly} />
							</InputRow>

							<InputRow icon={faShoppingCart} label={t("st_max_order")}>
								<input type="number" name="max_order" value={formData.max_order} onChange={handleChange} className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-300 py-1" placeholder="0" disabled={readOnly} />
							</InputRow>

							<InputRow icon={faCreditCard} label={t("st_max_purchase")}>
								<input type="number" name="maximum_purchase_amount" value={formData.maximum_purchase_amount} onChange={handleChange} className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-300 py-1" placeholder="0.00" disabled={readOnly} />
							</InputRow>

							<InputRow icon={faGlobeAmericas} label={t("st_whitelist_group")}>
								<MultiSelect options={groups} value={formData.country_group} onChange={handleCountryGroupChange} placeholder={t("st_whitelist_group_placeholder")} disabled={readOnly} />
							</InputRow>
						</div>
					</div>

					{/* Section 4: Description */}
					<div className="mt-8">
						<InputRow icon={faAlignLeft} label={t("st_desc")}>
							<textarea name="description" value={formData.description} onChange={handleChange} rows="2" className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-300 py-1 resize-none" placeholder={t("additionalDetails")} disabled={readOnly} />
						</InputRow>
					</div>
				</form>

				{/* Footer */}
				<div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
					<button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm" disabled={loading}>
						{readOnly ? t("close") : t("cancel")}
					</button>
					{!readOnly && (
						<button onClick={handleSubmit} disabled={loading} className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
							{loading && <FontAwesomeIcon icon={faSpinner} spin />}
							{t("save")}
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
