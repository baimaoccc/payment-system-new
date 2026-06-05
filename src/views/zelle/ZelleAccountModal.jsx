import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToast } from "../../store/slices/ui.js";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { isSuperAdmin as checkIsSuperAdmin } from "../../components/layout/menuConfig.js";
import {
  createStripeAccount,
  updateStripeAccount,
} from "../../controllers/stripeController.js";
import { fetchCountryGroupsN } from "../../controllers/countryController.js";
import { fetchCountryTransferListAll } from "../../controllers/countryTransferController.js";
import { fetchUserListNII } from "../../controllers/usersController.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faShieldAlt,
  faTimes,
  faSpinner,
  faIdCard,
  faMoneyBillWave,
  faShoppingCart,
  faCreditCard,
  faGlobeAmericas,
  faChartLine,
  faExchangeAlt,
  faAlignLeft,
  faCheck,
  faSearch,
  faUser,
  faToggleOn
} from "@fortawesome/free-solid-svg-icons";
import { Select } from "../../components/ui/Select.jsx";

const InputRow = ({
  icon,
  label,
  children,
  className = "",
  noBorder = false,
}) => (
  <div className={`flex items-start gap-4 ${className}`}>
    <div className="text-gray-400 w-6 pt-4 flex justify-center">
      <FontAwesomeIcon icon={icon} className="text-lg" />
    </div>
    <div
      className={`flex-1 ${noBorder ? "" : "border-b border-gray-200 focus-within:border-blue-600"} transition-colors pb-2 pt-1 relative`}
    >
      <label className="block text-xs font-medium text-gray-500 mb-0.5 uppercase tracking-wider">
        {label}
      </label>
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

export function ZelleAccountModal({
  isOpen,
  onClose,
  onSuccess,
  initialData = null,
  readOnly = false,
}) {
  const { t } = useI18n();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [groups, setGroups] = useState([]);
  const [transferPoints, setTransferPoints] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);

  const { role: authRole } = useSelector((state) => state.auth);
  const isSuperAdmin = checkIsSuperAdmin(authRole);

  const [formData, setFormData] = useState({
    comment: "",
    bankAccountHolder: "",
    max_money: "",
    max_order: "",
    maximum_purchase_amount: "",
    minimum_purchase_amount: "",
    country_group: "",
    zhuandianId: "",
    description: "",
    type: 3,
    user_id: null,
    status: 1
  });

  useEffect(() => {
    loadGroups();
    if (isSuperAdmin) {
      loadTransferPoints();
      fetchUserListNII().then((res) => {
        if (res.ok) {
          const users = res.data.list || res.data || [];
          setAdminUsers(users);
        }
      });
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

  const loadTransferPoints = async () => {
    const res = await fetchCountryTransferListAll();
    if (res.ok) {
      const list = res.data.list || res.data || [];
      setTransferPoints(
        list.map((tp) => ({
          value: tp.id,
          label: tp.country_code ? `${tp.country_code} (${tp.time_country})` : `ID: ${tp.id}`,
        }))
      );
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          id: initialData.id,
          comment: initialData.comment || "",
          bankAccountHolder: initialData.bankAccountHolder || initialData.account_name || "",
          max_money: initialData.max_money ?? "",
          max_order: initialData.max_order ?? "",
          maximum_purchase_amount: initialData.maximum_purchase_amount ?? "",
          minimum_purchase_amount: initialData.minimum_purchase_amount ?? "",
          country_group: initialData.country_group ? String(initialData.country_group) : "",
          zhuandianId: initialData.zhuandianId ?? "",
          description: initialData.description || "",
          type: initialData.type !== undefined ? initialData.type : 3,
          user_id: initialData.user_id || null,
          status: initialData.status !== undefined ? initialData.status : 1
        });
      } else {
        setFormData({
          comment: "",
          bankAccountHolder: "",
          max_money: "",
          max_order: "",
          maximum_purchase_amount: "",
          minimum_purchase_amount: "",
          country_group: "",
          zhuandianId: "",
          description: "",
          type: 3,
          user_id: null,
          status: 1
        });
      }
      setError(null);
    }
  }, [isOpen, initialData]);

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

    const requiredFields = [
      { key: "comment", label: t("zelleEmail") || "Email" },
      { key: "bankAccountHolder", label: t("zelleAccountName") || "Account Name" },
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
        dispatch(
          addToast({ id: Date.now(), type: "error", message: errorMsg }),
        );
        return;
      }
    }

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
      comment: formData.comment.trim(),
      bankAccountHolder: formData.bankAccountHolder.trim(),
      white_list: white_list_array,
    };

    let res;
    if (initialData) {
      res = await updateStripeAccount(payload);
    } else {
      res = await createStripeAccount(payload);
    }

    setLoading(false);

    if (res.ok) {
      dispatch(
        addToast({
          id: Date.now(),
          type: "success",
          message: t("saveSuccess"),
        }),
      );
      onSuccess();
      onClose();
    } else {
      const errorMsg = res.error?.message || t("saveFailed");
      dispatch(addToast({ id: Date.now(), type: "error", message: errorMsg }));
      setError(errorMsg);
    }
  };

  const modalTitle = readOnly
    ? t("details")
    : initialData
      ? t("zelle_edit") || "Edit Zelle Account"
      : t("zelle_add") || "Add Zelle Account";
  const modalDesc = readOnly
    ? t("st_modal_desc_view")
    : t("zelle_modal_desc_edit") || t("st_modal_desc_edit");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300 mx-2">
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white z-10">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{modalTitle}</h3>
            <p className="text-sm text-gray-500 mt-1">{modalDesc}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-50"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-8 custom-scrollbar"
        >
          {error && (
            <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 flex items-center gap-3">
              <FontAwesomeIcon icon={faShieldAlt} />
              {error}
            </div>
          )}

          <div className="mb-4">
            <SectionHeader
              title={t("st_info_title")}
              subtitle={t("st_info_subtitle")}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <InputRow icon={faToggleOn} label={t("st_status")} className="md:col-span-1" noBorder>
                <Select 
                  value={formData.status} 
                  onChange={(val) => setFormData((prev) => ({ ...prev, status: val }))} 
                  options={[
                    { value: 1, label: t("st_status_active") || "Active" },
                    { value: 0, label: t("st_status_inactive") || "Inactive" }
                  ]} 
                  placeholder={t("selectStatus") || "Select Status"} 
                  isDisabled={readOnly} 
                  className="w-full" 
                />
              </InputRow>

              {isSuperAdmin && (
                <InputRow icon={faUser} label={t("accountOwnership")} className="md:col-span-1" noBorder>
                  <Select 
                    value={formData.user_id} 
                    onChange={(val) => setFormData((prev) => ({ ...prev, user_id: val }))} 
                    options={adminUsers.map(u => ({ value: u.id, label: u.username }))} 
                    placeholder={t("selectUser") || "Select User"} 
                    isDisabled={readOnly} 
                    className="w-full" 
                    isClearable={true}
                  />
                </InputRow>
              )}

              <InputRow
                icon={faEnvelope}
                label={t("zelleEmail") || "Email"}
                className="md:col-span-1"
              >
                <input
                  type="email"
                  name="comment"
                  value={formData.comment}
                  onChange={handleChange}
                  className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-300 py-1"
                  placeholder="example@email.com"
                  disabled={readOnly}
                />
              </InputRow>

              <InputRow
                icon={faIdCard}
                label={t("zelleAccountName") || "Account Name"}
                className="md:col-span-1"
              >
                <input
                  type="text"
                  name="bankAccountHolder"
                  value={formData.bankAccountHolder}
                  onChange={handleChange}
                  className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-300 py-1"
                  placeholder="John Doe"
                  disabled={readOnly}
                />
              </InputRow>
            </div>
          </div>

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

              <InputRow icon={faCreditCard} label={t("st_min_purchase") || "Min Purchase"}>
                <input type="number" name="minimum_purchase_amount" value={formData.minimum_purchase_amount} onChange={handleChange} className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-300 py-1" placeholder="0.00" disabled={readOnly} />
              </InputRow>

              <InputRow icon={faGlobeAmericas} label={t("st_whitelist_group")} noBorder={true}>
                <MultiSelect options={groups} value={formData.country_group} onChange={handleCountryGroupChange} placeholder={t("st_whitelist_group_placeholder")} disabled={readOnly} />
              </InputRow>

              {isSuperAdmin && (
                <InputRow icon={faExchangeAlt} label={t("st_zhuandian")} noBorder={true}>
                  <Select value={formData.zhuandianId} onChange={(val) => setFormData((prev) => ({ ...prev, zhuandianId: val }))} options={transferPoints} placeholder={t("st_zhuandian_placeholder")} isDisabled={readOnly} className="w-full" isClearable={true} />
                </InputRow>
              )}

              <InputRow icon={faAlignLeft} label={t("st_desc")}>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="2" className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-300 py-1 resize-none" placeholder={t("additionalDetails")} disabled={readOnly} />
              </InputRow>
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"
            disabled={loading}
          >
            {readOnly ? t("close") : t("cancel")}
          </button>
          {!readOnly && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && <FontAwesomeIcon icon={faSpinner} spin />}
              {t("save")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
