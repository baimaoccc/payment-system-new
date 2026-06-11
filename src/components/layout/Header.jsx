import React, { useEffect, useState, useRef } from "react";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../controllers/authController.js";
import { NavLink } from "react-router-dom";
import { setTheme, toggleSidebar } from "../../store/slices/ui.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faSearch, faMoon, faSun, faCommentDots, faCreditCard, faBell, faUser, faEnvelope, faUserCircle, faSignOutAlt, faGlobe, faCheck, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { IconButton } from "../ui/IconButton.jsx";
import { MobileSidebar } from "./MobileSidebar.jsx";
import { useResponsive } from "../../hooks/useResponsive.js";
import { Logo } from "../common/Logo.jsx";
import { ROLE_MAP, MENU_CONFIG } from "./menuConfig.jsx";
import BrandTextImg from "../../assets/brand-text.png";
import { API_BASE_URL } from "../../constants/api.js";
import { idb } from "../../plugins/indexeddb/index.js";

/**
 * 顶部栏：语言切换、用户信息、登出
 */
export function Header() {
	const { t, lang, setLanguage } = useI18n();
	const dispatch = useDispatch();
	const user = useSelector((s) => s.auth.user);
	const authRole = useSelector((s) => s.auth.role);
	const notifications = useSelector((s) => s.ui.notifications);
	const messages = useSelector((s) => s.ui.messages);
	const theme = useSelector((s) => s.ui.theme);
	const { isMobile, isTablet } = useResponsive();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const profileRef = useRef(null);
	const [isLangOpen, setIsLangOpen] = useState(false);
	const langRef = useRef(null);

	useEffect(() => {
		function handleClickOutside(event) {
			if (profileRef.current && !profileRef.current.contains(event.target)) {
				setIsProfileOpen(false);
			}
			if (langRef.current && !langRef.current.contains(event.target)) {
				setIsLangOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [profileRef, langRef]);

	// Derive effective role
	const currentRole = user?.juese_id ? ROLE_MAP[user.juese_id] : authRole || "guest";

	const hasPermission = (path) => {
		// Recursive search for path in MENU_CONFIG
		const findItem = (items) => {
			for (const item of items) {
				if (item.path === path) return item;
				if (item.children) {
					const found = findItem(item.children);
					if (found) return found;
				}
			}
			return null;
		};

		const item = findItem(MENU_CONFIG);
		// If item not found or no roles defined, allowed for all
		if (!item || !item.roles || item.roles.length === 0) return true;

		return item.roles.includes(currentRole);
	};

	useEffect(() => {
		if (isMobile || isTablet) {
			dispatch(toggleSidebar(true));
		}
	}, [isTablet, isMobile]);

	const onLogout = async () => {
		setLoading(true);
		const res = await logout({ dispatch });
		setLoading(false);
		dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: res.ok ? "success" : "warning", message: res.ok ? t("logoutSuccess") : res.error?.message || t("logoutFailed") } });
	};
	const [appsOpen, setAppsOpen] = React.useState(false);

	const handleMenuClick = () => {
		if (isMobile) {
			setMobileMenuOpen(true);
		} else {
			dispatch(toggleSidebar());
		}
	};

	return (
		<header className="h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700/50 px-4 md:px-6 py-3 transition-colors duration-200">
			<MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
			<div className="flex items-center justify-between w-full">
				<div className="flex items-center gap-2 text-sm">
					<IconButton icon={faBars} label="menu" onClick={handleMenuClick} />
				</div>
				<div className="flex items-center gap-2 md:gap-4">
					<div className="relative" ref={langRef}>
						<IconButton onClick={() => setIsLangOpen(!isLangOpen)} icon={faGlobe} label={t("language")} />
						{isLangOpen && (
							<div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700/50 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
								<button
									onClick={() => {
										setLanguage("en");
										setIsLangOpen(false);
									}}
									className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${lang === "en" ? "text-blue-600 font-medium bg-blue-50 dark:bg-gray-700 dark:text-blue-400" : "text-gray-700 dark:text-gray-200"}`}>
									<span>English</span>
									{lang === "en" && <FontAwesomeIcon icon={faCheck} className="text-xs" />}
								</button>
								<button
									onClick={() => {
										setLanguage("zh");
										setIsLangOpen(false);
									}}
									className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${lang === "zh" ? "text-blue-600 font-medium bg-blue-50 dark:bg-gray-700 dark:text-blue-400" : "text-gray-700 dark:text-gray-200"}`}>
									<span>中文</span>
									{lang === "zh" && <FontAwesomeIcon icon={faCheck} className="text-xs" />}
								</button>
							</div>
						)}
					</div>
					<div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full p-1 border border-gray-200 dark:border-gray-700/50">
						<button
							onClick={() => {
								dispatch(setTheme("light"));
								idb.set("theme", "light");
							}}
							className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${theme === "light" ? "bg-white dark:bg-gray-800 text-yellow-500 shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
							title={t("lightMode") || "Light Mode"}>
							<FontAwesomeIcon icon={faSun} className="text-sm" />
						</button>
						<button
							onClick={() => {
								dispatch(setTheme("dark"));
								idb.set("theme", "dark");
							}}
							className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${theme === "dark" ? "bg-gray-600 text-blue-300 shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
							title={t("darkMode") || "Dark Mode"}>
							<FontAwesomeIcon icon={faMoon} className="text-sm" />
						</button>
					</div>
					{/* <div className="relative">
						<IconButton icon={faCommentDots} label={t("messages")} />
						<span className="absolute -top-1 -right-1 bg-peach text-white text-xs px-1 rounded">{messages}</span>
					</div>
					<div className="relative">
						<IconButton icon={faBell} label={t("notifications")} />
						<span className="absolute -top-1 -right-1 bg-action-yellow text-white text-xs px-1 rounded">{notifications}</span>
					</div> */}

					{/* User Profile Dropdown */}
					<div className="relative" ref={profileRef}>
						<button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 rounded-lg transition-colors focus:outline-none">
							{user?.avatar ? <img src={API_BASE_URL + user.avatar} alt="avatar" className="w-7 h-7 rounded-full object-cover border border-gray-200 dark:border-gray-700/50" /> : <FontAwesomeIcon icon={faUserCircle} className="text-2xl text-gray-600 dark:text-gray-400" />}
							<span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden lg:block">{user?.username || t("guest")}</span>
						</button>

						{isProfileOpen && (
							<div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700/50 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
								<div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/50">
									<p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.username || t("guest")}</p>
									{user?.role && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user.role}</p>}
								</div>
								<button
									onClick={() => {
										setIsProfileOpen(false);
										onLogout();
									}}
									disabled={loading}
									className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2 transition-colors disabled:opacity-50">
									{loading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSignOutAlt} />}
									{t("logout")}
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</header>
	);
}
