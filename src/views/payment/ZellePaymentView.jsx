import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { request } from "../../plugins/http/baseAPI.js";
import zelleLogo from "../../assets/zelle-logo-white.webp";
import { API_ORDER_SEARCH_PUBLIC, API_ZELLE_SET_CONFIRMATION } from "../../constants/api.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faCheckCircle, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useI18n } from "../../plugins/i18n/index.jsx";

export function ZellePaymentView() {
	const { t, setLanguage } = useI18n();
	const location = useLocation();

	// Set language to English by default when visiting this specific page
	useEffect(() => {
		setLanguage("en");
	}, []);
	const queryParams = new URLSearchParams(location.search);
	const orderNo = queryParams.get("orderNo");
	
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [orderInfo, setOrderInfo] = useState(null);
	const [zelleAccount, setZelleAccount] = useState(null);
	const [copiedField, setCopiedField] = useState(null);
	const [step, setStep] = useState(1);
	const [formData, setFormData] = useState({
		confirmationNumber: "",
		zelleUsername: ""
	});
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				
				// Fetch Order Info
				const orderRes = await request({
					url: API_ORDER_SEARCH_PUBLIC,
					method: "POST",
					data: { orderNo }
				});
				
				if (!orderRes.ok || orderRes.data?.code != 1) {
					throw new Error(orderRes.error?.message || orderRes.data?.msg || t("zp_orderNotFound"));
				}
				
				let order = null;
				const rawData = orderRes.data.data;
				const list = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.list) ? rawData.list : (Array.isArray(rawData?.data) ? rawData.data : []));
				
				if (list.length > 0) {
					order = list[0];
				} else if (rawData && typeof rawData === "object" && Object.keys(rawData).length > 0) {
					order = rawData;
				}
				
				if (!order) {
					throw new Error(t("zp_orderNotFound"));
				}
				
				setOrderInfo(order);

				// If order status is already 1 (success), skip to success step
				if (order.status === 1) {
					setStep(3);
				}

				// Extract zelle account info directly from the order details
				setZelleAccount({
					email: order.comment || order.zelle_email || order.zelleEmail || order.email || "N/A",
					bankAccountHolder: order.bankAccountHolder || order.zelle_account_name || order.zelleAccountName || order.account_name || "N/A"
				});
				
				setLoading(false);
			} catch (err) {
				console.error("Failed to load payment info:", err);
				setError(err.message || t("zp_loadingDetails"));
				setLoading(false);
			}
		};

		if (orderNo) {
			fetchData();
		} else {
			setError(t("zp_invalidOrderNo"));
			setLoading(false);
		}
	}, [orderNo]);

	const handleCopy = (text, field) => {
		if (text) {
			navigator.clipboard.writeText(text).then(() => {
				setCopiedField(field);
				setTimeout(() => setCopiedField(null), 2000);
			});
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleNextStep = () => {
		setStep(2);
	};

	const handleSubmitPayment = async (e) => {
		e.preventDefault();
		if (!formData.confirmationNumber || !formData.zelleUsername) {
			alert(t("zp_fillAllFields"));
			return;
		}

		try {
			setSubmitting(true);
			// You may need to adjust this API call based on your actual backend endpoint
			const res = await request({
				url: API_ZELLE_SET_CONFIRMATION, // Ensure this endpoint exists or adjust as needed
				method: "POST",
				data: {
					orderNo,
					confirmation_number: formData.confirmationNumber,
					confirmation_name: formData.zelleUsername
				}
			});

			if (res.ok && res.data?.code == 1) {
				setStep(3); // Success step
				// Redirect to success URL if provided
				if (orderInfo?.return_url) {
					setTimeout(() => {
						window.location.href = orderInfo.return_url;
					}, 2500);
				}
			} else {
				throw new Error(res.data?.msg || res.error?.message || t("zp_failedConfirm"));
			}
		} catch (err) {
			alert(err.message || t("zp_errorOccurred"));
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
				<div className="flex flex-col items-center text-[#6d1ac8]">
					<FontAwesomeIcon icon={faSpinner} spin className="text-4xl mb-4" />
					<p className="text-sm font-medium">{t("zp_loadingDetails")}</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
				<div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
					<div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
						!
					</div>
					<h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t("zp_errorTitle")}</h2>
					<p className="text-gray-500 dark:text-gray-400">{error}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
			<div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-[24px] shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700/50">
				
				{/* Header with Zelle Logo and Amount */}
				<div className="bg-[#6d1ac8] px-8 py-10 text-center text-white relative overflow-hidden">
					{/* Decorative circles */}
					<div className="absolute -top-10 -right-10 w-32 h-32 bg-white dark:bg-gray-800 opacity-10 rounded-full"></div>
					<div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white dark:bg-gray-800 opacity-10 rounded-full"></div>
					
					<div className="relative z-10">
						{/* Zelle Logo (Image) */}
						<div className="flex justify-center mb-6">
							<img src={zelleLogo} alt="Zelle" className="h-10 object-contain" />
						</div>
						
						<p className="text-purple-200 text-sm font-medium mb-1 uppercase tracking-wider">{t("zp_paymentAmount")}</p>
						<h1 className="text-5xl font-bold tracking-tight">
							{orderInfo?.currency === 'USD' ? '$' : (orderInfo?.currency || '$')}
							{orderInfo?.amount || '0.00'}
						</h1>
						<p className="text-purple-200 text-sm mt-2">{t("zp_orderNo")} {orderNo}</p>
					</div>
				</div>

				{/* Payment Details Section */}
				<div className="px-8 py-8">
					{step === 1 && (
						<>
							<h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">{t("zp_sendPaymentTo")}</h3>
							
							<div className="space-y-5">
								{/* Email Field */}
								<div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 relative group transition-all hover:border-[#6d1ac8] hover:shadow-sm">
									<label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{t("zp_zelleEmail")}</label>
									<div className="flex justify-between items-center">
										<p className="text-gray-900 dark:text-gray-100 font-medium text-base truncate pr-4">{zelleAccount?.email || "N/A"}</p>
										<button 
											onClick={() => handleCopy(zelleAccount?.email, 'email')}
											className="flex-shrink-0 text-[#6d1ac8] hover:text-purple-800 transition-colors p-2 -mr-2"
											title="Copy Email"
										>
											<FontAwesomeIcon icon={copiedField === 'email' ? faCheckCircle : faCopy} className={copiedField === 'email' ? "text-green-500" : ""} />
										</button>
									</div>
								</div>

								{/* Account Holder Name Field */}
								<div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 relative group transition-all hover:border-[#6d1ac8] hover:shadow-sm">
									<label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{t("zp_accountHolderName")}</label>
									<div className="flex justify-between items-center">
										<p className="text-gray-900 dark:text-gray-100 font-medium text-base truncate pr-4">{zelleAccount?.bankAccountHolder || "N/A"}</p>
										<button 
											onClick={() => handleCopy(zelleAccount?.bankAccountHolder, 'name')}
											className="flex-shrink-0 text-[#6d1ac8] hover:text-purple-800 transition-colors p-2 -mr-2"
											title="Copy Name"
										>
											<FontAwesomeIcon icon={copiedField === 'name' ? faCheckCircle : faCopy} className={copiedField === 'name' ? "text-green-500" : ""} />
										</button>
									</div>
								</div>
							</div>

							<div className="mt-8 text-center">
								<p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
									{t("zp_sendInstruction")}
								</p>
								<button 
									className="w-full bg-[#6d1ac8] text-white py-3.5 px-4 rounded-xl font-bold text-sm shadow-lg shadow-purple-500/30 hover:bg-purple-700 hover:shadow-purple-500/40 transition-all transform hover:-translate-y-0.5"
									onClick={handleNextStep}
								>
									{t("zp_completedPaymentBtn")}
								</button>
							</div>
						</>
					)}

					{step === 2 && (
						<form onSubmit={handleSubmitPayment}>
							<h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">{t("zp_confirmPaymentTitle")}</h3>
							<p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
								{t("zp_confirmInstruction")}
							</p>
							
							<div className="space-y-5">
								<div className="bg-white dark:bg-gray-800 p-1 relative">
									<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t("zp_confirmationNumber")}</label>
									<input 
										type="text" 
										name="confirmationNumber"
										value={formData.confirmationNumber}
										onChange={handleInputChange}
										placeholder={t("zp_confNumPlaceholder")}
										className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700/50 rounded-xl focus:outline-none focus:border-[#6d1ac8] focus:ring-1 focus:ring-[#6d1ac8] transition-all"
										required
									/>
								</div>

								<div className="bg-white dark:bg-gray-800 p-1 relative">
									<label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t("zp_zelleUsername")}</label>
									<input 
										type="text" 
										name="zelleUsername"
										value={formData.zelleUsername}
										onChange={handleInputChange}
										placeholder={t("zp_zelleNamePlaceholder")}
										className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700/50 rounded-xl focus:outline-none focus:border-[#6d1ac8] focus:ring-1 focus:ring-[#6d1ac8] transition-all"
										required
									/>
								</div>
							</div>

							<div className="mt-8 flex flex-col gap-3">
								<button 
									type="submit"
									disabled={submitting}
									className="w-full bg-[#6d1ac8] text-white py-3.5 px-4 rounded-xl font-bold text-sm shadow-lg shadow-purple-500/30 hover:bg-purple-700 hover:shadow-purple-500/40 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none flex justify-center items-center gap-2"
								>
									{submitting && <FontAwesomeIcon icon={faSpinner} spin />}
									{t("zp_submitConfirmation")}
								</button>
								<button 
									type="button"
									onClick={() => setStep(1)}
									disabled={submitting}
									className="w-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 py-3.5 px-4 rounded-xl font-bold text-sm border border-gray-200 dark:border-gray-700/50 hover:bg-gray-50 dark:bg-gray-900 transition-all"
								>
									{t("zp_back")}
								</button>
							</div>
						</form>
					)}

					{step === 3 && (
						<div className="text-center py-6">
							<div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
								<FontAwesomeIcon icon={faCheckCircle} className="text-4xl" />
							</div>
							<h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
								{orderInfo?.status === 1 ? t("zp_paymentAlreadyCompletedTitle") : t("zp_paymentConfirmedTitle")}
							</h3>
							<p className="text-gray-500 dark:text-gray-400 mb-6">
								{orderInfo?.status === 1 ? t("zp_paymentAlreadyCompletedDesc") : t("zp_paymentConfirmedDesc")}
							</p>
							{orderInfo?.return_url && (
								<p className="text-sm text-[#6d1ac8] font-medium">
									{t("zp_redirecting")}
								</p>
							)}
						</div>
					)}
				</div>
			</div>
			
			<div className="mt-8 text-center text-xs text-gray-400">
				<p>{t("zp_disclaimer")}</p>
			</div>
		</div>
	);
}
