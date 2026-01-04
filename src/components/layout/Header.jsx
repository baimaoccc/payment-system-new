import React, { useEffect, useState, useRef } from "react";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../controllers/authController.js";
import { NavLink } from "react-router-dom";
import { setTheme, toggleSidebar } from "../../store/slices/ui.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faSearch, faMoon, faCommentDots, faCreditCard, faBell, faUser, faEnvelope, faUserCircle, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { IconButton } from "../ui/IconButton.jsx";
import { MobileSidebar } from "./MobileSidebar.jsx";
import { useResponsive } from "../../hooks/useResponsive.js";
import { Logo } from "../common/Logo.jsx";
import { ROLE_MAP, MENU_CONFIG } from "./menuConfig";
import BrandTextImg from "../../assets/brand-text.png";

/**
 * 顶部栏：语言切换、用户信息、登出
 */
export function Header() {
	const { t } = useI18n();
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

	useEffect(() => {
		function handleClickOutside(event) {
			if (profileRef.current && !profileRef.current.contains(event.target)) {
				setIsProfileOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [profileRef]);

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
	const toggleTheme = () => {
		const next = theme === "light" ? "dark" : "light";
		dispatch(setTheme(next));
		document.documentElement.classList.toggle("dark");
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
		<header className="h-16 bg-white border-b px-4 md:px-6 py-3">
			<MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
			<div className="flex items-center justify-between w-full">
				<div className="flex items-center gap-2 text-sm">
					<IconButton icon={faBars} label="menu" onClick={handleMenuClick} />

					
					{/* <IconButton icon={faSearch} label={t("search")} /> */}
					{/* <div className="relative">
						<button onClick={() => setAppsOpen((v) => !v)} className="px-2 md:px-3 py-1 rounded hover:bg-gray-100 flex items-center gap-1">
							<FontAwesomeIcon icon={faThLarge} />
							<span className="hidden sm:inline">{t("apps")}</span>
							<FontAwesomeIcon icon={faChevronDown} className="text-xs" />
						</button>
						{appsOpen && (
							<div className="absolute z-10 mt-2 w-40 bg-white border rounded shadow">
								<NavLink to="#" className="block px-3 py-2 hover:bg-gray-50">
									{t("chat")}
								</NavLink>
								<NavLink to="#" className="block px-3 py-2 hover:bg-gray-50">
									{t("calendar")}
								</NavLink>
								<NavLink to="#" className="block px-3 py-2 hover:bg-gray-50">
									{t("email")}
								</NavLink>
							</div>
						)}
					</div> */}
					{hasPermission("/stripe-accounts") && (
						<NavLink to="/stripe-accounts" className="px-3 py-1 rounded hover:bg-gray-100 hidden md:inline">
							<FontAwesomeIcon icon={faCreditCard} /> {t("stripeAccounts")}
						</NavLink>
					)}
					{hasPermission("/users") && (
						<NavLink to="/users" className="px-3 py-1 rounded hover:bg-gray-100 hidden md:inline">
							<FontAwesomeIcon icon={faUser} /> {t("user")}
						</NavLink>
					)}
					{hasPermission("/email/types") && (
						<NavLink to="/email/types" className="px-3 py-1 rounded hover:bg-gray-100 hidden md:inline">
							<FontAwesomeIcon icon={faEnvelope} /> {t("email")}
						</NavLink>
					)}
				</div>
				<div className="flex items-center gap-2 md:gap-4">
					<div className="hidden sm:block">
						<IconButton onClick={toggleTheme} icon={faMoon} label={t("theme")} />
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
						<button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 hover:bg-gray-100 p-1.5 rounded-lg transition-colors focus:outline-none">
							{user?.avatar ? <img src={user.avatar} alt="avatar" className="w-7 h-7 rounded-full object-cover border border-gray-200" /> : <FontAwesomeIcon icon={faUserCircle} className="text-2xl text-gray-600" />}
							<span className="text-sm font-medium text-gray-700 hidden lg:block">{user?.username || t("guest")}</span>
						</button>

						{isProfileOpen && (
							<div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
								<div className="px-4 py-3 border-b border-gray-100">
									<p className="text-sm font-medium text-gray-900 truncate">{user?.username || t("guest")}</p>
									{user?.role && <p className="text-xs text-gray-500 mt-0.5">{user.role}</p>}
								</div>
								<button
									onClick={() => {
										setIsProfileOpen(false);
										onLogout();
									}}
									disabled={loading}
									className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors disabled:opacity-50">
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
