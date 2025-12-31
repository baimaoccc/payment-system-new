import React from 'react';

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
    // { value: 8, label: t("pendingWithdrawal") },
    // { value: 9, label: t("refunded") },
    // { value: 120, label: t("120-day-delay") },
];

/**
 * Renders the order status column content.
 * @param {Object} order - The order object.
 * @param {Function} t - The translation function.
 * @returns {React.ReactNode}
 */
export function renderOrderStatus(order, t) {
    const status = String(order.status);
    let label = t("noPay");
    let badgeCls = "bg-grey-4 text-gray-700";

    // Check status
    const isPaid = status === "1" || status === "paid";
    const isFailed = status === "6" || status === "2" || status === "failed";
    const isNoPay = status === "0" || status === "pending";
    const isPendingWithdrawal = status === "8";
    const isRefunded = status === "9";
    const isDelayed = status === "120";

    if (isPaid) {
        label = t("succeed");
        badgeCls = "bg-action-green text-white";
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
    }

    return (
        <div className="flex flex-col items-start">
            <span className={`inline-block py-1 px-3 rounded text-center text-xs font-medium ${badgeCls}`}>
                {label}
            </span>
            
            <div className="text-gray-500 text-[10px] space-y-1">
                {/* Risk Score - Shown for both success and failure if present */}
                {(isPaid || isFailed) && order.risk_score !== undefined && order.risk_score !== null && (
                     <div title={t("riskScore")}>
                        <span className="text-gray-400">{t("riskScore")}:</span> {order.risk_score}
                     </div>
                )}

                {/* Failure Details - Only for failed */}
                {isFailed && (
                    <>
                        {order.failure_code && (
                            <div className="text-red-400 truncate max-w-[150px]" title={order.failure_code}>
                                <span className="text-gray-400">{t("failureCode")}:</span> {order.failure_code}
                            </div>
                        )}
                        {order.failure_message && (
                            <div className="text-red-400 truncate max-w-[150px]" title={order.failure_message}>
                                <span className="text-gray-400">{t("failureMsg")}:</span> {order.failure_message}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
