import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faMoneyBillWave, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { createStripePayout } from "../../controllers/stripeController.js";
import { isZeroDecimalCurrency } from "../../utils/stripeStatusUtils.js";
import { useDispatch } from "react-redux";
import { useResponsive } from "../../hooks/useResponsive.js";

export function StripeCreatePayoutModal({ isOpen, onClose, accountId, maxAmount, currency, onSuccess }) {
	const { t } = useI18n();
	const dispatch = useDispatch();
	const { isMobile, isTablet } = useResponsive();
	const [amount, setAmount] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const isZeroDecimal = isZeroDecimalCurrency(currency);
	// format the max amount for display
	const displayMaxAmount = isZeroDecimal ? maxAmount : maxAmount / 100;

	useEffect(() => {
		if (isOpen) {
			setAmount("");
			setError("");
		}
	}, [isOpen]);

	if (!isOpen) return null;

	const handlePayout = async () => {
		setError("");
		
		const parsedAmount = parseFloat(amount);
		if (isNaN(parsedAmount) || parsedAmount <= 0) {
			setError(t("enterPayoutAmount"));
			return;
		}

		if (parsedAmount > displayMaxAmount) {
			setError(t("payoutAmountExceedsAvailable"));
			return;
		}

		setLoading(true);

		// Convert amount back to cents if needed, Stripe API expects integer
		const apiAmount = isZeroDecimal ? Math.round(parsedAmount) : Math.round(parsedAmount * 100);

		const res = await createStripePayout({
			id: accountId,
			amount: apiAmount.toString(),
			method: "instant",
			currency: currency.toLowerCase()
		});

		setLoading(false);

		if (res.ok) {
			dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "success", message: t("payoutSuccess") || "Payout created successfully" } });
			if (onSuccess) onSuccess();
			onClose();
		} else {
			const errMsg = res.error?.message || t("payoutFailed") || "Payout creation failed";
			setError(errMsg);
			dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "error", message: errMsg } });
		}
	};

	return (
		<div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
			<div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={!loading ? onClose : undefined} />
			<div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
				<div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700/50">
					<div className="flex items-center gap-3">
						<div className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 p-2 rounded-lg">
							<FontAwesomeIcon icon={faMoneyBillWave} />
						</div>
						<div>
							<h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t("createPayout")}</h3>
							<p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t("payoutDesc")}</p>
						</div>
					</div>
					<button onClick={!loading ? onClose : undefined} disabled={loading} className="text-gray-400 hover:text-gray-600 dark:text-gray-400 transition-colors p-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
						<FontAwesomeIcon icon={faTimes} className="text-xl" />
					</button>
				</div>

				<div className="p-6 space-y-4">
					<div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
						<span className="text-sm text-gray-500 dark:text-gray-400">{t("maxAvailable")}</span>
						<span className="font-bold text-gray-900 dark:text-gray-100 text-lg">
							{displayMaxAmount} <span className="uppercase text-xs text-gray-500 ml-1">{currency}</span>
						</span>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("payoutAmountLabel")}</label>
						<div className="relative">
							<input
								type="number"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								placeholder={t("enterPayoutAmount")}
								className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-gray-100 transition-all"
								disabled={loading}
								min="0"
								step={isZeroDecimal ? "1" : "0.01"}
							/>
							<div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium uppercase text-sm">
								{currency}
							</div>
						</div>
						{error && <p className="text-red-500 text-xs mt-1">{error}</p>}
					</div>
				</div>

				<div className="p-6 pt-2 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
					<button onClick={onClose} disabled={loading} className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 w-full sm:w-auto">
						{t("cancel")}
					</button>
					<button onClick={handlePayout} disabled={loading || !amount} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto">
						{loading && <FontAwesomeIcon icon={faSpinner} spin />}
						{t("confirmPayout")}
					</button>
				</div>
			</div>
		</div>
	);
}
