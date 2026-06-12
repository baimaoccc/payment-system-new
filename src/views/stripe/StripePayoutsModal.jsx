import React, { useEffect, useState } from "react";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { fetchStripePayouts } from "../../controllers/stripeController.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faTimes, faMoneyCheckAlt } from "@fortawesome/free-solid-svg-icons";
import { isZeroDecimalCurrency } from "../../utils/stripeStatusUtils.js";
import { useResponsive } from "../../hooks/useResponsive.js";

export function StripePayoutsModal({ isOpen, onClose, accountId }) {
	const { t } = useI18n();
	const { isMobile, isTablet } = useResponsive();
	const [list, setList] = useState([]);
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [lastId, setLastId] = useState(null);

	useEffect(() => {
		if (isOpen && accountId) {
			loadInitialData();
		} else {
			setList([]);
			setHasMore(false);
			setLastId(null);
		}
	}, [isOpen, accountId]);

	const loadInitialData = async () => {
		setLoading(true);
		const res = await fetchStripePayouts({ id: accountId, limit: 100 });
		if (res.ok) {
			setList(res.data.list);
			setHasMore(res.data.hasMore);
			setLastId(res.data.lastId);
		}
		setLoading(false);
	};

	const loadMore = async () => {
		if (!hasMore || loading) return;
		setLoading(true);
		const res = await fetchStripePayouts({ id: accountId, limit: 100, starting_after: lastId });
		if (res.ok) {
			setList([...list, ...res.data.list]);
			setHasMore(res.data.hasMore);
			setLastId(res.data.lastId);
		}
		setLoading(false);
	};

	const formatAmount = (amount, currency) => {
		if (!currency) return amount;
		const isZeroDecimal = isZeroDecimalCurrency(currency);
		const value = isZeroDecimal ? amount : amount / 100;
		try {
			return new Intl.NumberFormat(undefined, {
				style: "currency",
				currency: currency.toUpperCase(),
			}).format(value);
		} catch (e) {
			return `${value} ${currency.toUpperCase()}`;
		}
	};

    if (!isOpen) return null;

	return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] md:max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800 z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-50 text-green-600 p-2 rounded-lg hidden sm:block">
                            <FontAwesomeIcon icon={faMoneyCheckAlt} />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">{t("st_payout_list") || "Payouts List"}</h3>
                            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">ID: {accountId}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-400 transition-colors p-2 rounded-full hover:bg-gray-50 dark:bg-gray-900 shrink-0">
                        <FontAwesomeIcon icon={faTimes} className="text-lg sm:text-xl" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-0 custom-scrollbar bg-gray-50/50 dark:bg-gray-900/20">
                    <div className="flex flex-col h-full">
                        <div className="bg-white dark:bg-gray-800 flex-1 flex flex-col">
                            {isMobile ? (
                                // Mobile View: Card layout
                                <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
                                    {list.length === 0 && !loading ? (
                                        <div className="p-8 text-center text-gray-400 text-sm">{t("noData")}</div>
                                    ) : (
                                        list.map((item) => (
                                            <div key={item.id} className="p-4 flex flex-col gap-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex flex-col gap-1">
                                                        <span className={`text-base font-bold ${item.amount > 0 ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-gray-100"}`}>
                                                            {formatAmount(item.amount, item.currency)}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 font-mono break-all">{item.id}</span>
                                                    </div>
                                                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider shrink-0
                                                        ${item.status === "paid" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : item.status === "pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" : item.status === "failed" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" : item.status === "canceled" ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400" : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"}`}>
                                                        {item.status}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-[11px] bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg">
                                                    <div>
                                                        <span className="text-gray-500 block mb-0.5">{t("payoutArrivalDate")}</span>
                                                        <span className="text-gray-700 dark:text-gray-300">{item.arrival_date ? new Date(item.arrival_date * 1000).toLocaleDateString() : "-"}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 block mb-0.5">{t("createTime")}</span>
                                                        <span className="text-gray-700 dark:text-gray-300">{item.created ? new Date(item.created * 1000).toLocaleDateString() : "-"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            ) : (
                                // Desktop/Tablet View: Table layout
                                <div className="overflow-x-auto custom-scrollbar">
                                    <table className="w-full text-xs sm:text-sm text-left whitespace-nowrap">
                                        <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10 shadow-sm">
                                            <tr>
                                                <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">ID</th>
                                                <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">{t("payoutAmount")}</th>
                                                <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">{t("payoutStatus")}</th>
                                                <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">{t("payoutArrivalDate")}</th>
                                                <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">{t("createTime")}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {list.length === 0 && !loading ? (
                                                <tr>
                                                    <td colSpan="5" className="px-4 py-8 text-center text-gray-400">
                                                        {t("noData")}
                                                    </td>
                                                </tr>
                                            ) : (
                                                list.map((item) => (
                                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                                        <td className="px-4 py-3 font-mono text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{item.id}</td>
                                                        <td className="px-4 py-3 font-medium">
                                                            <span className={item.amount > 0 ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-gray-100"}>
                                                                {formatAmount(item.amount, item.currency)}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span
                                                                className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider
                                                                ${item.status === "paid" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : item.status === "pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" : item.status === "failed" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" : item.status === "canceled" ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400" : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"}`}>
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.arrival_date ? new Date(item.arrival_date * 1000).toLocaleString() : "-"}</td>
                                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.created ? new Date(item.created * 1000).toLocaleString() : "-"}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Pagination/Load More Footer */}
                            {hasMore && (
                                <div className="p-3 sm:p-4 border-t border-gray-100 dark:border-gray-800 flex justify-center bg-white dark:bg-gray-800 shrink-0">
                                    <button onClick={loadMore} disabled={loading} className="px-6 py-2 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50 flex items-center gap-2 w-full sm:w-auto justify-center">
                                        {loading && <FontAwesomeIcon icon={faSpinner} spin />}
                                        {t("loadMore") || "加载更多"}
                                    </button>
                                </div>
                            )}
                            {!hasMore && list.length > 0 && (
                                <div className="p-3 sm:p-4 text-center text-xs text-gray-400 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 shrink-0">
                                    {t("noMoreData") || "没有更多数据了"}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
	);
}