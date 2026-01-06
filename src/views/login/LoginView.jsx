import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { login, restoreSession, getCaptcha } from "../../controllers/authController.js";
import { Logo } from "../../components/common/Logo.jsx";
import onboardingLogo from "../../assets/onboarding-logo.png";
import brandTextImg from "../../assets/brand-text.png";
import { Select } from "../../components/ui/Select.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useResponsive } from "../../hooks/useResponsive.js";

/**
 * 登录页视图：左侧插画区 + 右侧表单区（极简风格）
 */
export function LoginView() {
	const { t, lang, setLanguage } = useI18n();
	const dispatch = useDispatch();
	const {isMobile} = useResponsive();
	const navigate = useNavigate();
	const location = useLocation();
	const isAuthed = useSelector((s) => s.auth.isAuthed);
	const loading = useSelector((s) => s.auth.loading);
	const role = useSelector((s) => s.auth.role);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [remember, setRemember] = useState(true);
	const [code, setCode] = useState("");
	const [showCaptcha, setShowCaptcha] = useState(false);
	const [captchaLoading, setCaptchaLoading] = useState(false);
	const from = location.state?.from?.pathname || "/orders";
	const roleRoute = role === "admin" ? "/dashboard" : "/orders";

	useEffect(() => {
		restoreSession({ dispatch });
	}, [dispatch]);
	useEffect(() => {
		if (isAuthed) navigate(from || roleRoute, { replace: true });
	}, [isAuthed, from, roleRoute, navigate]);

	const onSubmit = async (e) => {
		e.preventDefault();
		const res = await login({ dispatch, username, password, code, remember });
		if (res.ok) {
			navigate(from || roleRoute, { replace: true });
		} else {
			const err = res.error || {};
			const msg = err.message || (err.uiAPICode ? t(err.uiAPICode) : t("loginFailed"));

			if (msg.includes("验证码不正确") || msg.includes("Captcha is incorrect")) {
				if (!showCaptcha) {
					setShowCaptcha(true);
					dispatch({ type: "ui/addToast", payload: { type: "warning", message: t("pleaseEnterCaptcha") || "Please enter captcha" } });
					return;
				}
			}

			dispatch({ type: "ui/setModal", payload: { title: t("login"), message: msg } });
		}
	};

	const onGetCode = async () => {
		if (captchaLoading) return;
		setCaptchaLoading(true);
		try {
			const res = await getCaptcha({ dispatch, username });
			if (!res.ok) {
				const msg = res.error?.message ? t(res.error.message) : t("captchaFetchFailed");
				dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: res.error?.message === "pleaseEnterUsername" ? "info" : "error", message: msg } });
				return;
			}
			// setCode(res.data);
			dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "success", message: t("captchaFetched") } });
		} finally {
			setCaptchaLoading(false);
		}
	};

	return (
		<div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
			{/* 左侧插画区 */}
			<div className="hidden md:flex items-center justify-center bg-brand-12 p-8">
				<div className="w-full max-w-lg">
					<div className="mb-6 flex items-center gap-2">
						<Logo size={60} />
						<img src={brandTextImg} alt="" className="h-[40px] object-contain" />
					</div>
					{/* <div className="aspect-video rounded-2xl bg-white shadow flex items-center justify-center">
						<div className="text-gray-400">{t("illustrationPlaceholder")}</div>
					</div> */}
					<img src={onboardingLogo} alt="onboarding" className="w-full h-full object-cover rounded-2xl" />
				</div>
			</div>

			{/* 右侧表单区 */}
			<div className={`flex items-center justify-center p-6 ${isMobile ? 'bg-brand-12 flex-col' : 'bg-white flex-row'}`}>
				{isMobile && <img src={onboardingLogo} alt="onboarding" className="w-[300px] h-auto object-cover rounded-2xl" />}
				<div className="w-full max-w-md">
					<div className="flex justify-end mb-4">
						<Select
							value={lang}
							onChange={(v) => setLanguage(v)}
							options={[
								{ value: "zh", label: "中文" },
								{ value: "en", label: "English" },
							]}
							className="min-w-[120px]"
						/>
					</div>
					<div className="mb-6">
						<h1 className="text-2xl font-semibold text-gray-800">{t("welcomeTitle")}</h1>
						<div className="text-sm text-gray-500">
							{t("welcomeSub")}
							{/* <button type="button" className="ml-2 text-brand hover:text-brand-dark">
								{t("createAccount")}
							</button> */}
						</div>
					</div>
					<form onSubmit={onSubmit} className="space-y-4">
						<label className="block">
							<span className="text-sm text-gray-600">{t("username")} *</span>
							<input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" placeholder={t("username")} />
						</label>
						<label className="block">
							<span className="text-sm text-gray-600">{t("password")} *</span>
							<div className="relative mt-1">
								<input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded px-3 py-2 pr-10" />
								<button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600">
									<FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
								</button>
							</div>
						</label>
						{showCaptcha && (
							<label className="block">
								<span className="text-sm text-gray-600">{t("captcha")} *</span>
								<div className="mt-1 flex gap-2">
									<input value={code} onChange={(e) => setCode(e.target.value)} className="flex-1 border rounded px-3 py-2" />
									<button type="button" onClick={onGetCode} disabled={captchaLoading} className={`px-3 py-2 rounded border bg-secondary-12 text-sm flex items-center gap-2 ${captchaLoading ? "opacity-70 cursor-not-allowed" : ""}`}>
										{captchaLoading && <FontAwesomeIcon icon={faSpinner} spin />}
										{t("getCaptcha")}
									</button>
								</div>
							</label>
						)}
						{/* <div className="flex items-center justify-between">
							<label className="flex items-center gap-2">
								<input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
								<span>{t("rememberDevice")}</span>
							</label>
							<button type="button" className="text-brand hover:text-brand-dark text-sm">
								{t("forgotPassword")}
							</button>
						</div> */}
						<button type="submit" disabled={loading} className={`w-full rounded py-2 flex items-center justify-center gap-2 ${loading ? "bg-gray-400 cursor-not-allowed text-white" : "bg-brand text-white"}`}>
							{loading ? (
								<>
									<FontAwesomeIcon icon={faSpinner} spin />
									{t("signIn")}...
								</>
							) : (
								t("signIn")
							)}
						</button>
					</form>
					{/* <div className="text-center text-sm text-gray-500 my-4">{t("orSignIn")}</div>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
						<button className="border rounded py-2">{t("socialButton")}</button>
						<button className="border rounded py-2">{t("facebook")}</button>
						<button className="border rounded py-2">{t("twitter")}</button>
					</div> */}
				</div>
			</div>
		</div>
	);
}
