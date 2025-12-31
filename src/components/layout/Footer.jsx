import React from "react";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { NavLink } from "react-router-dom";
import Select from "react-select";
import { db } from "../../utils/indexedDB.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTelegram } from "@fortawesome/free-brands-svg-icons";

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
					<span className="text-gray-500">© 2025 {t("appTitle")}</span>
					{/* <NavLink to="#" className="hover:text-brand">
						{t("privacyPolicy")}
					</NavLink>
					<NavLink to="#" className="hover:text-brand">
						{t("termsOfService")}
					</NavLink> */}
					<a
						href={telegramLink}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 group"
					>
						<FontAwesomeIcon icon={faTelegram} className="text-lg group-hover:scale-110 transition-transform" />
						<span className="font-medium">
							{t("contactUs")}: {telegram}
						</span>
					</a>
					{/* <a href="#" className="hover:text-brand">
						{t("icpRecord")}: {icp}
					</a> */}
				</div>
				<div className="flex flex-wrap justify-center items-center gap-3">
					<span className="text-gray-500">{t("language")}</span>
					<div className="w-[140px]">
						<Select
							value={languageOptions.find((o) => o.value === lang)}
							onChange={handleLanguageChange}
							options={languageOptions}
							menuPlacement="top"
							menuPosition="absolute"
							classNamePrefix="react-select"
							styles={{
								menu: (base) => ({ ...base, zIndex: 9999, marginBottom: "4px" }),
								control: (base) => ({ ...base, minHeight: "36px", cursor: "pointer" }),
							}}
						/>
					</div>
				</div>
			</div>
		</footer>
	);
}
