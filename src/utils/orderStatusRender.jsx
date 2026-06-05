import React from "react";
import stripeIcon from "../assets/stripe-icon.jpg";
import klarnaIcon from "../assets/klarna-icon.jpg"; // We keep the asset name but import it as airwallexIcon for now, until asset is replaced
import idealIcon from "../assets/ideal-icon.png"; // We keep the asset name but import it as airwallexIcon for now, until asset is replaced
import bancontactIcon from "../assets/bancontact-icon.png"; // We keep the asset name but import it as airwallexIcon for now, until asset is replaced
import fishIcon from "../assets/fish-icon.png";

/**
 * Returns the list of status options for dropdown selectors.
 * @param {Function} t - The translation function.
 * @returns {Array} List of status options.
 */
export const getOrderStatusOptions = (t) => [
	{ value: "all", label: t("all") },
	{ value: 1, label: t("succeed") },
	{ value: 6, label: t("failed") },
	{ value: 0, label: t("noPay") },
	{ value: 2, label: t("testSucceed") },
	{ value: 5, label: t("fiveDayRefund") },
	// { value: 8, label: t("pendingWithdrawal") },
	{ value: 9, label: t("refunded") },
	{ value: 120, label: t("120-day-delay") },
];

/**
 * Renders the order status column content.
 * @param {Object} order - The order object.
 * @param {Function} t - The translation function.
 * @returns {React.ReactNode}
 */
export function renderOrderStatus(order, t, showDetails = true) {
	const status = String(order.status);
	let label = t("noPay");
	let badgeCls = "bg-grey-4 text-gray-700";

	// Check status
	const isPaid = status === "1" || status === "paid";
	const isTestSucceed = status === "2";
	const isFailed = status === "6" || status === "failed";
	const isNoPay = status === "0" || status === "pending";
	const isPendingWithdrawal = status === "8";
	const isRefunded = status === "9";
	const isDelayed = status === "120";
	const isFiveDayRefund = status === "5";

	if (isPaid) {
		label = t("succeed");
		badgeCls = "bg-action-green text-white";
	} else if (isTestSucceed) {
		label = t("testSucceed");
		badgeCls = "bg-blue-500 text-white";
	} else if (isFailed) {
		label = t("failed");
		badgeCls = "bg-peach text-white";
	} else if (isNoPay) {
		label = t("noPay");
		badgeCls = "bg-grey-4 text-gray-700";
	} else if (isPendingWithdrawal) {
		label = t("pendingWithdrawal") || "Pending Withdrawal";
		badgeCls = "bg-yellow-500 text-white";
	} else if (isRefunded) {
		label = t("refunded") || "Refunded";
		badgeCls = "bg-purple-500 text-white";
	} else if (isDelayed) {
		label = t("120-day-delay") || "120-Day Delay";
		badgeCls = "bg-orange-500 text-white";
	} else if (isFiveDayRefund) {
		label = t("fiveDayRefund") || "5-Day Refund";
		badgeCls = "bg-orange-500 text-white";
	}

	const typeType = String(order.type_type ?? "");
	const paymentChannel = String(order.paymentChannel ?? "");

	let iconSrc = stripeIcon;
	switch (typeType) {
		case "0":
			iconSrc = fishIcon;
			break;
		case "1":
			iconSrc = stripeIcon;
			break;
		case "2":
			{
				if (paymentChannel === "klarna") {
					iconSrc = klarnaIcon;
				} else if (paymentChannel === "ideal") {
					iconSrc = idealIcon;
				} else if (paymentChannel === "bancontact") {
					iconSrc = bancontactIcon;
				}
			} break;
		default:
			iconSrc = null;
			break;
	}

	return (
		<div className="flex flex-col items-start min-w-0 w-full overflow-hidden">
			<span className={`inline-flex items-center gap-1 py-1 px-3 rounded text-center text-xs font-medium flex-none ${badgeCls}`}>
				{iconSrc && <img src={iconSrc} alt={typeType === "0" ? "Fish" : typeType === "1" ? "Stripe" : "Airwallex"} className="h-3 object-contain" />}
				{label}
			</span>

			{showDetails && (
				<div className="text-gray-500 text-[10px] space-y-0.5 mt-1 w-full overflow-hidden">
					{/* Risk Score - Shown for both success and failure if present */}
					{(isPaid || isFailed || isTestSucceed) && order.risk_score !== undefined && order.risk_score !== null && (
						<div title={t("riskScore")} className="truncate">
							<span className="text-gray-400">{t("riskScore")}:</span> {order.risk_score}
						</div>
					)}

					{/* Failure Details - Only for failed */}
					{isFailed && (
						<div className="flex flex-col gap-0.5 w-full overflow-hidden">
							{order.failure_code && (
								<div className="text-red-400 truncate w-full" title={order.failure_code}>
									<span className="text-gray-400">{t("failureCode")}:</span> {order.failure_code}
								</div>
							)}
							{order.failure_message && (
								<div className="text-red-400 truncate w-full" title={order.failure_message}>
									<span className="text-gray-400">{t("failureMsg")}:</span> {order.failure_message}
								</div>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
