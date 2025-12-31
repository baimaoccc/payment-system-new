import React, { useState, useEffect } from "react";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { fetchStripeWarnings } from "../../controllers/stripeController.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faExclamationTriangle, faSpinner, faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";

export function StripeWarningModal({ isOpen, onClose, accountId }) {
    const { t } = useI18n();
    const [loading, setLoading] = useState(false);
    const [list, setList] = useState([]);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    
    // Reset state when modal opens
    useEffect(() => {
        if (isOpen && accountId) {
            setList([]);
            loadData();
        }
    }, [isOpen, accountId]);

    const loadData = async (loadMore = false) => {
        if (!accountId) return;
        
        const isInitial = !loadMore;
        if (isInitial) setLoading(true);
        else setLoadingMore(true);

        try {
            const params = { 
                id: accountId, 
                limit: 20 
            };
            
            if (loadMore && list.length > 0) {
                params.starting_after = list[list.length - 1].id;
            }

            const res = await fetchStripeWarnings(params);
            
            if (res.ok) {
                const newData = res.data.list || [];
                if (loadMore) {
                    setList(prev => [...prev, ...newData]);
                } else {
                    setList(newData);
                }
                setHasMore(res.data.hasMore);
            } else {
                // Handle error silently or show toast (not implemented here)
                console.error(res.error);
            }
        } catch (err) {
            console.error(err);
        } finally {
            if (isInitial) setLoading(false);
            else setLoadingMore(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-50 text-orange-600 p-2 rounded-lg">
                            <FontAwesomeIcon icon={faExclamationTriangle} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{t("st_warning_list")}</h3>
                            <p className="text-xs text-gray-500 mt-0.5">ID: {accountId}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-50">
                        <FontAwesomeIcon icon={faTimes} className="text-xl" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-0 custom-scrollbar bg-gray-50/50">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <FontAwesomeIcon icon={faSpinner} spin className="text-blue-500 text-2xl" />
                        </div>
                    ) : list.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl mb-3 opacity-20" />
                            <p className="text-sm">{t("noData")}</p>
                        </div>
                    ) : (
                        <div className="p-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-4 py-3 font-medium text-gray-500">{t("st_fraud_type")}</th>
                                                <th className="px-4 py-3 font-medium text-gray-500">{t("st_actionable")}</th>
                                                <th className="px-4 py-3 font-medium text-gray-500">{t("st_charge")}</th>
                                                <th className="px-4 py-3 font-medium text-gray-500">{t("date")}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {list.map((item, idx) => (
                                                <tr key={item.id || idx} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            item.fraud_type === 'card_testing' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
                                                        }`}>
                                                            {t(`fraud_type_${item.fraud_type}`) || item.fraud_type}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {item.actionable ? (
                                                            <span className="text-green-600 flex items-center gap-1">
                                                                <FontAwesomeIcon icon={faCheckCircle} className="text-xs" /> {t("yes")}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400 flex items-center gap-1">
                                                                <FontAwesomeIcon icon={faTimesCircle} className="text-xs" /> {t("no")}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.charge}</td>
                                                    <td className="px-4 py-3 text-gray-500">
                                                        {item.created ? new Date(item.created * 1000).toLocaleString() : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Load More */}
                            {hasMore && (
                                <div className="mt-4 text-center">
                                    <button 
                                        onClick={() => loadData(true)} 
                                        disabled={loadingMore}
                                        className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                                    >
                                        {loadingMore ? (
                                            <>
                                                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                                {t("loading")}
                                            </>
                                        ) : (
                                            t("next")
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
