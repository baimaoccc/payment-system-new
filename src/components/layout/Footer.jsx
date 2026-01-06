import React from "react";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { NavLink } from "react-router-dom";
import Select from "react-select";
import { db } from "../../utils/indexedDB.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTelegram } from "@fortawesome/free-brands-svg-icons";
import { faGlobe, faCheck } from "@fortawesome/free-solid-svg-icons";

export function Footer() {
	const { t, lang, setLanguage } = useI18n();
	const telegram = "@ACeo_Pay";
	const telegramLink = "https://t.me/ACeo_Pay";
	const icp = "ICP备 2025-000001";

	const languageOptions = [
		{ value: "zh", label: "中文" },
		{ value: "en", label: "English" },
	];

	const handleLanguageChange = (option) => {
		setLanguage(option.value);
		db.set("lang", option.value);
	};

	return (
		<footer className="bg-white w-full border-t px-4 py-6 lg:px-6 lg:py-4 text-sm">
			<div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-4">
				<div className="flex flex-wrap justify-center lg:justify-start items-center gap-x-4 gap-y-2 text-gray-600">
					<span className="text-gray-500 font-medium tracking-wide text-xs sm:text-sm">Copyright © 2025 {t("appTitle")}. All Rights Reserved.</span>
					{/* <NavLink to="#" className="hover:text-brand">
						{t("privacyPolicy")}
					</NavLink>
					<NavLink to="#" className="hover:text-brand">
						{t("termsOfService")}
					</NavLink> */}

					{/* <a href="#" className="hover:text-brand">
						{t("icpRecord")}: {icp}
					</a> */}
				</div>
				<div className="relative flex items-center">
					{/* <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 group">
						<FontAwesomeIcon icon={faTelegram} className="text-lg group-hover:scale-110 transition-transform" />
						<span className="font-medium">
							{t("contactUs")}: {telegram}
						</span>
					</a> */}

					<div className="relative ml-4">
						<FontAwesomeIcon icon={faGlobe} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none text-xs" />
						<div className="w-[140px]">
							<Select
								value={languageOptions.find((o) => o.value === lang)}
								onChange={handleLanguageChange}
								options={languageOptions}
								menuPlacement="top"
								menuPosition="absolute"
								classNamePrefix="react-select"
								components={{
									IndicatorSeparator: () => null,
								}}
								styles={{
									control: (base, state) => ({
										...base,
										minHeight: "32px",
										paddingLeft: "24px",
										borderRadius: "9999px",
										backgroundColor: state.isFocused ? "white" : "#F9FAFB",
										borderColor: state.isFocused ? "#3B82F6" : "#E5E7EB",
										boxShadow: state.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.1)" : "none",
										cursor: "pointer",
										fontSize: "13px",
										"&:hover": {
											borderColor: "#D1D5DB",
											backgroundColor: "white",
										},
									}),
									menu: (base) => ({
										...base,
										zIndex: 9999,
										marginBottom: "8px",
										borderRadius: "12px",
										overflow: "hidden",
										boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
										border: "1px solid #F3F4F6",
									}),
									option: (base, state) => ({
										...base,
										fontSize: "13px",
										padding: "8px 12px",
										backgroundColor: state.isSelected ? "#EFF6FF" : state.isFocused ? "#F9FAFB" : "white",
										color: state.isSelected ? "#2563eb" : "#374151",
										cursor: "pointer",
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										":active": {
											backgroundColor: "#EFF6FF",
										},
									}),
									singleValue: (base) => ({
										...base,
										color: "#4B5563",
										fontWeight: 500,
									}),
									dropdownIndicator: (base) => ({
										...base,
										padding: "4px 8px",
										color: "#9CA3AF",
										"&:hover": {
											color: "#6B7280",
										},
									}),
								}}
								formatOptionLabel={(option, { context }) => (
									<div className="flex items-center justify-between w-full">
										<span>{option.label}</span>
										{context === "menu" && option.value === lang && <FontAwesomeIcon icon={faCheck} className="text-blue-600 text-xs" />}
									</div>
								)}
							/>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
