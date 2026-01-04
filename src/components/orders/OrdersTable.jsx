import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlaneDeparture, faCheckSquare, faEnvelope, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { renderOrderStatus } from "../../utils/orderStatusRender.jsx";
import { RiskAnalysisModal } from "./RiskAnalysisModal.jsx";
import { EmailTasksModal } from "../email/EmailTasksModal.jsx";
import { fetchOrders, updateOrderLogistics, sendOrderEmailByTemplate, fetchOrderRiskLevel } from "../../controllers/ordersController.js";
import { useResponsive } from "../../hooks/useResponsive.js";
import { ActionDropdown } from "../ui/ActionDropdown.jsx";
import { setSidebarCollapsed } from "../../store/slices/ui.js";

export function OrdersTable({ rows = [] }) {
	const { t } = useI18n();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { isMobile, isTablet } = useResponsive();

	useEffect(() => {
		if (isTablet) {
			dispatch(setSidebarCollapsed(true));
		}
	}, [isTablet, dispatch]);

	const { page, pageSize, filters, emailTemplates } = useSelector((s) => ({
		page: s.orders.page,
		pageSize: s.orders.pageSize,
		filters: s.orders.filters,
		emailTemplates: s.ui.emailTemplatesAll || [],
	}));
	const safeRows = Array.isArray(rows) ? rows : [];

	const [expandedMobileRow, setExpandedMobileRow] = useState(null);
	const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
	const [selectedRiskData, setSelectedRiskData] = useState(null);
	const [isLogisticsModalOpen, setIsLogisticsModalOpen] = useState(false);
	const [logisticsSaving, setLogisticsSaving] = useState(false);
	const [logisticsForm, setLogisticsForm] = useState({ id: null, logistics_mode: "", tracking_number: "" });
	const [activeUpdateOrderId, setActiveUpdateOrderId] = useState(null);
	const [activeEmailOrderId, setActiveEmailOrderId] = useState(null);
	const [emailTasksModalOpen, setEmailTasksModalOpen] = useState(false);
	const [selectedOrderNo, setSelectedOrderNo] = useState(null);
	const [loadingRiskOrderId, setLoadingRiskOrderId] = useState(null);

	const handleOpenRiskAnalysis = async (order) => {
		if (loadingRiskOrderId) return;
		setLoadingRiskOrderId(order.id);
		const res = await fetchOrderRiskLevel({ id: order.id });
		setLoadingRiskOrderId(null);

		if (res.ok) {
			const data = res.data || {};
			const charges = data.charges || {};
			const metadata = charges.metadata || {};
			const outcome = charges.outcome || {};
			const billing = charges.billing_details || {};
			const address = billing.address || {};
			const ipRisk = data.IPaddressRisklevel || {};
			const paymentMethodDetails = charges.payment_method_details || {};
			const card = paymentMethodDetails.card || {};

			const mappedData = {
				riskScore: outcome.risk_score || 0,
				customer: {
					email: billing.email || order.email || "",
					name: billing.name || order.username || "",
					phone: billing.phone || order.phone || "",
					billingAddress: [address.line1, address.line2, address.city, address.state, address.postal_code, address.country].filter(Boolean).join(", ") || order.billingAddress || "",
				},
				payment: {
					brand: card.brand,
					last4: card.last4,
					funding: card.funding,
					country: card.country,
					cvcCheck: card.checks?.cvc_check,
					threeDSecure: card.three_d_secure?.result,
					wallet: card.wallet,
					expiry: card.exp_month && card.exp_year ? `${card.exp_month}/${card.exp_year}` : "",
					type: data.charges.payment_method_details?.type,
					network: card.network,
					amountAuthorized: card.amount_authorized,
					authorizationCode: card.authorization_code,
					fingerprint: card.fingerprint,
					addressCheck: card.checks?.address_line1_check,
					zipCheck: card.checks?.address_postal_code_check,
					networkTransactionId: card.network_transaction_id,
				},
				checkout: {
					ip: metadata.ip || metadata.clinet_ip_address || order.ip || "",
					hostname: metadata.hostname,
					city: metadata.city,
					region: metadata.region,
					country: metadata.country,
					postal: metadata.postal,
					loc: metadata.loc,
					org: metadata.org,
					timezone: metadata.timezone,
					userAgent: metadata.user_agent,
					vpn: ipRisk.vpn ? "Yes" : null,
					proxy: ipRisk.proxy ? "Yes" : null,
				},
			};
			setSelectedRiskData(mappedData);
			setIsRiskModalOpen(true);
		} else {
			dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "error", message: res.error?.message || t("fetchRiskFailed") || "Failed to fetch risk analysis" } });
		}
	};

	const handleOpenLogisticsModal = (order) => {
		setLogisticsForm({
			id: order.id,
			logistics_mode: order.logistics_mode || "",
			tracking_number: order.tracking_number || "",
		});
		setIsLogisticsModalOpen(true);
		setActiveUpdateOrderId(null);
	};

	const handleOrderCallback = (order) => {
		dispatch({
			type: "ui/setModal",
			payload: {
				title: t("orderCallback") || "Order Callback",
				message: t("confirmUpdateOrderToSuccess") || "Are you sure to mark this order as succeeded?",
				variant: "danger",
				showCancel: true,
				confirmText: t("confirm") || "Confirm",
				cancelText: t("cancel") || "Cancel",
				onConfirm: async () => {
					const res = await updateOrderLogistics({ id: order.id, status: 1 });
					if (res.ok) {
						dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "success", message: t("saveSuccess") } });
						fetchOrders({ dispatch, page, pageSize, filters });
					} else {
						dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "error", message: res.error?.message || t("saveFailed") } });
					}
				},
			},
		});
		setActiveUpdateOrderId(null);
	};

	const handleLogisticsSubmit = async (e) => {
		e.preventDefault();
		if (!logisticsForm.id || !logisticsForm.logistics_mode || !logisticsForm.tracking_number) return;
		setLogisticsSaving(true);
		const res = await updateOrderLogistics({
			id: logisticsForm.id,
			logistics_mode: logisticsForm.logistics_mode,
			tracking_number: logisticsForm.tracking_number,
			status: null,
		});
		setLogisticsSaving(false);
		if (res.ok) {
			dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "success", message: t("saveSuccess") } });
			setIsLogisticsModalOpen(false);
			fetchOrders({ dispatch, page, pageSize, filters });
		} else {
			dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "error", message: res.error?.message || t("saveFailed") } });
		}
	};

	const handleSelectEmailTemplate = (order, templateId) => {
		if (!templateId) return;
		const template = emailTemplates.find((tpl) => String(tpl.id) === String(templateId));
		if (!template) return;
		const orderNo = order.orderNo || order.client_orderNo || order.id || "";
		const templateName = template.name || template.title || template.template_name || `#${template.id}`;
		const displayName = order.username || [order.first_name, order.last_name].filter(Boolean).join(" ") || t("guest");
		const email = order.email || "-";
		const isPaid = order.status === "paid" || order.status === 1 || order.status === "1";
		const isFailed = order.status === "failed" || order.status === 2 || order.status === "2";
		const statusLabel = isPaid ? t("succeed") : isFailed ? t("failed") : t("noPay");
		const msgTpl = t("sendEmailConfirm") || "确定给订单 {orderNo} 发送 {templateName} 邮件吗？";
		const confirmLine = msgTpl.replace("{orderNo}", orderNo || "-").replace("{templateName}", templateName);
		const message = (
			<div className="space-y-3 text-sm">
				<div className="text-xs text-gray-500">{t("sendEmailConfirmIntro") || "请确认邮件发送目标信息："}</div>
				<div className="space-y-1 text-xs">
					<div>
						<span className="text-gray-400 text-[11px]">{t("orderId") || "订单号"}:</span> <span className="font-mono text-[11px]">{orderNo || "-"}</span>
					</div>
					<div>
						<span className="text-gray-400 text-[11px]">{t("customer") || "客户"}:</span> <span className="text-[11px]">{displayName}</span>
					</div>
					<div>
						<span className="text-gray-400 text-[11px]">{t("email") || "邮箱"}:</span> <span className="text-[11px]">{email}</span>
					</div>
					<div>
						<span className="text-gray-400 text-[11px]">{t("status") || "状态"}:</span> <span className="text-[11px]">{statusLabel}</span>
					</div>
					<div>
						<span className="text-gray-400 text-[11px]">{t("templateName") || "模版"}:</span> <span className="text-[11px]">{templateName}</span>
					</div>
				</div>
				<div className="mt-2 text-sm font-medium text-gray-900">{confirmLine}</div>
			</div>
		);
		dispatch({
			type: "ui/setModal",
			payload: {
				title: t("sendEmail") || "Send Email",
				message,
				showCancel: true,
				confirmText: t("confirm") || "Confirm",
				cancelText: t("cancel") || "Cancel",
				onConfirm: async () => {
					const res = await sendOrderEmailByTemplate({ template_id: template.id, orderNo });
					if (res.ok) {
						dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "success", message: t("sendEmailSuccess") || t("saveSuccess") } });
					} else {
						dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "error", message: res.error?.message || t("sendEmailFailed") || t("saveFailed") } });
					}
				},
			},
		});
	};

	const handleCopy = (text) => {
		if (!text) return;
		navigator.clipboard
			.writeText(text)
			.then(() => {
				dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "success", message: t("copied") } });
			})
			.catch(() => {
				dispatch({ type: "ui/addToast", payload: { id: Date.now(), type: "error", message: t("copyFailed") } });
			});
	};

	const handleOpenEmailTasks = (orderNo) => {
		setSelectedOrderNo(orderNo);
		setEmailTasksModalOpen(true);
	};

	const getActions = (o) => {
		const actions = [
			{
				label: t("details"),
				icon: (
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
						<circle cx="12" cy="12" r="3" />
					</svg>
				),
				onClick: () => navigate(`/orders/${o.id}`),
				className: "text-blue-600",
			},
			{
				label: loadingRiskOrderId === o.id ? t("loading") : t("radar"),
				icon:
					loadingRiskOrderId === o.id ? (
						<svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
							<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
					) : (
						<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<path d="M12 12h.01" />
							<path d="M14.1 16.1a5 5 0 0 0 0-8.2" />
							<path d="M16.2 18.2a8 8 0 0 0 0-12.4" />
							<path d="M18.3 20.3a11 11 0 0 0 0-16.6" />
						</svg>
					),
				onClick: () => handleOpenRiskAnalysis(o),
				className: "text-purple-600",
				disabled: loadingRiskOrderId === o.id,
			},
			{
				label: t("email"),
				icon: <FontAwesomeIcon icon={faEnvelope} />,
				onClick: () => handleOpenEmailTasks(o.orderNo || o.client_orderNo || o.id),
				className: "text-indigo-600",
			},
		];

		if (o.status === 1) {
			actions.push({
				label: t("logisticsShipment") || "Logistics Shipment",
				icon: <FontAwesomeIcon icon={faPlaneDeparture} />,
				onClick: () => handleOpenLogisticsModal(o),
				className: "text-gray-700",
			});
		}

		actions.push({
			label: t("orderCallback") || "Order Callback",
			icon: <FontAwesomeIcon icon={faCheckSquare} />,
			onClick: () => handleOrderCallback(o),
			className: "text-green-600",
		});

		return actions;
	};

	return (
		<div className="mt-3">
			{isMobile ? (
				<div className="space-y-3">
					{safeRows.map((o) => {
						const createDate = o.createtime ? new Date(o.createtime).toLocaleString() : "-";
						const updateDate = o.updatetime ? new Date(o.updatetime).toLocaleString() : "-";
						const isExpanded = expandedMobileRow === o.id;

						return (
							<div key={o.id} className={`bg-white rounded-lg shadow-sm border transition-all box-border ${isExpanded ? "border-blue-500" : "border-gray-100"}`} onClick={() => setExpandedMobileRow(isExpanded ? null : o.id)}>
								{/* Header / Summary Row */}
								<div className="p-3 flex items-center justify-between gap-3">
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1">
											<div className="font-medium text-gray-900 truncate text-sm">{o.url || "-"}</div>
										</div>
										<div className="flex items-center gap-2 text-xs text-gray-500">
											<span className="truncate max-w-[100px]">{o.username || t("guest")}</span>
											<span>•</span>
											<span className="font-mono">
												{o.amount} {o.currency}
											</span>
										</div>
									</div>

									<div className="flex items-center gap-2 flex-none">
										<div className="scale-90 origin-right">{renderOrderStatus(o, t, false)}</div>
										<div onClick={(e) => e.stopPropagation()}>
											<ActionDropdown actions={getActions(o)} />
										</div>
									</div>
								</div>

								{/* Expanded Content */}
								<div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
									<div className="overflow-hidden">
										<div className="px-3 pb-3 pt-0 text-xs text-gray-600 space-y-2 border-t border-gray-50 mt-1">
											{/* Channel & Ref */}
											<div className="grid grid-cols-2 gap-2 mt-3">
												<div>
													<span className="text-gray-400 block mb-0.5">{t("paymentChannel") || "Payment Channel"}</span>
													<span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px]">{o.comment || t("untitledChannel")}</span>
												</div>
												{o.client_orderNo && (
													<div>
														<span className="text-gray-400 block mb-0.5">{t("ref")}</span>
														<span
															className="font-mono bg-gray-50 rounded break-all"
															onClick={(e) => {
																e.stopPropagation();
																handleCopy(o.client_orderNo);
															}}>
															{o.client_orderNo}
														</span>
													</div>
												)}
											</div>

											{/* Customer */}
											<div className="space-y-1">
												<div className="font-medium text-gray-800">{t("customer")}</div>
												<div>{[o.first_name, o.last_name].filter(Boolean).join(" ") || t("guest")}</div>
												<div className="flex items-center gap-2">
													<span
														onClick={(e) => {
															e.stopPropagation();
															handleCopy(o.email);
														}}>
														{o.email || "-"}
													</span>
												</div>
												{o.phone && (
													<div
														onClick={(e) => {
															e.stopPropagation();
															handleCopy(o.phone);
														}}>
														{o.phone}
													</div>
												)}
												{o.ip && (
													<div className="text-[10px] text-gray-400">
														IP: {o.ip} ({o.country_code})
													</div>
												)}
											</div>

											{/* Time */}
											<div className="grid grid-cols-2 gap-2">
												<div>
													<span className="text-gray-400 block mb-0.5">{t("createTime") || "Created"}</span>
													{createDate}
												</div>
												<div>
													<span className="text-gray-400 block mb-0.5">{t("upd")}</span>
													{updateDate}
												</div>
											</div>

											{/* Logistics */}
											{(o.shipping_status || o.logistics_mode || o.tracking_number) && (
												<div className="bg-gray-50 p-2 rounded">
													{o.shipping_status && (
														<div className="flex items-center mb-2">
															<div className="font-medium text-gray-800 mr-2">{t("logisticsInfo") || "Logistics"}:</div>
															{o.shipping_status == "未发货" ? <span className="text-yellow-500 font-medium">{t("notShipped")}</span> : <span className="text-green-500 font-medium">{t("shipped")}</span>}

															{/* {t("status")}: {o.shipping_status} */}
															{/* logisticsInfo */}
														</div>
													)}
													{o.tracking_number && (
														<div>
															{t("trackingNumber")}: {o.tracking_number}
														</div>
													)}
												</div>
											)}
										</div>
									</div>
								</div>
							</div>
						);
					})}
					{safeRows.length === 0 && <div className="text-center text-gray-400 py-8">{t("noData")}</div>}
				</div>
			) : (
				<table className="w-full text-xs table-fixed">
					<thead className="bg-gray-100">
						<tr>
							{!isTablet && <th className="px-3 py-3 text-left font-medium text-gray-700 w-[10%]">{t("orderBelong")}</th>}
							<th className={`px-3 py-3 text-left font-medium text-gray-700 ${isTablet ? "w-[25%]" : "w-[18%]"}`}>{t("orderDetailsAndChannel")}</th>
							<th className={`px-3 py-3 text-left font-medium text-gray-700 ${isTablet ? "w-[30%]" : "w-[18%]"}`}>{t("customer")}</th>
							<th className={`px-3 py-3 text-left font-medium text-gray-700 ${isTablet ? "w-[15%]" : "w-[10%]"}`}>{t("amount")}</th>
							<th className={`px-3 py-3 text-left font-medium text-gray-700 ${isTablet ? "w-[15%]" : "w-[10%]"}`}>{t("status")}</th>
							{!isTablet && <th className="px-3 py-3 text-left font-medium text-gray-700 w-[10%]">{t("timeline")}</th>}
							{!isTablet && <th className="px-3 py-3 text-left font-medium text-gray-700 w-[12%]">{t("logisticsInfo") || "Logistics"}</th>}
							<th className={`px-3 py-3 text-left font-medium text-gray-700 ${isTablet ? "w-[15%]" : "w-[10%]"}`}>{t("operations")}</th>
						</tr>
					</thead>
					<tbody>
						{safeRows.map((o) => {
							// Date Logic
							const createDate = o.createtime ? new Date(o.createtime).toLocaleString() : "-";
							const updateDate = o.updatetime ? new Date(o.updatetime).toLocaleString() : "-";

							return (
								<tr key={o.id} className="border-t hover:bg-gray-50 transition-colors">
									{/* Order Belong */}
									{!isTablet && (
										<td className="p-3 align-middle">
											<div className="font-bold text-gray-900 text-sm truncate align-middle" title={`Order No: ${o.orderNo || "-"}`}>
												{o.username || t("guest")}
											</div>
										</td>
									)}

									{/* Order Details */}
									<td className="p-3 align-top">
										<div className="flex flex-col gap-1">
											{/* <div className="font-bold text-gray-900 text-sm truncate" title={`Order No: ${o.orderNo || "-"}`}>
											{o.title || t("untitledOrder")}
										</div> */}
											<div className="font-bold text-gray-900 text-sm truncate" title={o.url}>
												<span className="font-medium text-gray-600">{t("site")}: </span> {o.url || "-"}
											</div>
											<div className="text-gray-500 truncate text-xs" title={`Channel: ${o.comment || "-"}`}>
												<span className="font-medium">{t("paymentChannel") || "Payment Channel"}:</span> {o.comment || t("untitledChannel")}
											</div>
											{isTablet && (
												<div className="text-xs text-gray-400">
													<span className="font-medium">{t("owner")}:</span>
													<span className="ml-2 text-purple-600 font-medium">{o.username || t("guest")}</span>
												</div>
											)}

											{o.client_orderNo && (
												<div className="flex items-center gap-1 text-[10px] text-gray-400">
													<span className="font-medium">{t("ref")}:</span>
													<span className="font-mono bg-gray-50 px-1 rounded truncate max-w-[100px] cursor-pointer hover:bg-gray-100 transition-colors" title={`${o.client_orderNo} (${t("clickToCopy")})`} onClick={() => handleCopy(o.client_orderNo)}>
														{o.client_orderNo}
													</span>
												</div>
											)}
										</div>
									</td>

									{/* Customer Info */}

									<td className="p-3 align-top">
										<div className="flex flex-col gap-1">
											<div className="font-medium text-gray-900 truncate" title={[o.first_name, o.last_name].filter(Boolean).join(" ") || t("guest")}>
												{[o.first_name, o.last_name].filter(Boolean).join(" ") || t("guest")}
											</div>
											<div className={`text-gray-500 truncate ${o.email ? "cursor-pointer hover:text-blue-600 transition-colors" : ""}`} title={o.email ? `${o.email} (${t("clickToCopy")})` : "-"} onClick={() => o.email && handleCopy(o.email)}>
												{o.email || "-"}
											</div>
											<div className="flex items-center gap-2 text-gray-400 text-[10px] truncate">
												<span className={`truncate ${o.phone ? "cursor-pointer hover:text-blue-600 transition-colors" : ""}`} title={o.phone ? `${o.phone} (${t("clickToCopy")})` : ""} onClick={() => o.phone && handleCopy(o.phone)}>
													{o.phone || "-"}
												</span>
												{o.country_code && <span className="bg-blue-50 text-blue-600 px-1 rounded uppercase flex-none">{o.country_code}</span>}
												{o.ip && (
													<span title={o.ip} className="truncate">
														IP: {o.ip}
													</span>
												)}
											</div>
										</div>
									</td>

									{/* Financials */}
									<td className="p-3 align-top">
										<div className="flex flex-col gap-1">
											<div className="font-bold text-gray-900 text-sm">
												{o.amount} <span className="text-xs font-normal text-gray-500">{o.currency}</span>
											</div>
											{(o.jine || o.bizhong) && (
												<div className="text-gray-500">
													≈ {o.jine} <span className="text-[10px]">{o.bizhong}</span>
												</div>
											)}
											{o.huilv && (
												<div className="text-gray-400 text-[10px]">
													{t("rate")}: {o.huilv}
												</div>
											)}
										</div>
									</td>

									{/* Status & Channel */}
									<td className="p-3 align-top">{renderOrderStatus(o, t)}</td>

									{/* Timeline */}
									{!isTablet && (
										<td className="p-3 align-top">
											<div className="flex flex-col gap-1 text-gray-500">
												{updateDate !== "-" && (
													<div title={`Updated: ${updateDate}`}>
														<span className="text-gray-400 text-[10px]">{t("upd")}:</span> {updateDate.split(" ")[0]}
														<div className="text-[10px] pl-5">{updateDate.split(" ")[1]}</div>
													</div>
												)}
											</div>
										</td>
									)}
									{/* Logistics */}
									{!isTablet && (
										<td className="p-3 align-top">
											<div className="flex flex-col gap-1 text-gray-500">
												{(o.shipping_status || o.logistics_mode || o.tracking_number) && (
													<div className="mt-1 space-y-0.5 text-[11px]">
														{o.shipping_status && (
															<div>
																{t("status")}: {o.shipping_status}
															</div>
														)}
														{o.tracking_number && (
															<div className="flex items-center gap-1">
																<span>{o.tracking_number}</span>
															</div>
														)}
													</div>
												)}
											</div>
										</td>
									)}

									{/* Operations */}
									<td className="p-3 align-top">
										<div className="flex items-center flex-wrap gap-1">
											{getActions(o).map((action, idx) => (
												<button
													key={idx}
													onClick={(e) => {
														e.stopPropagation();
														action.onClick();
													}}
													className={`p-1.5 hover:bg-gray-100 rounded transition-colors ${action.className}`}
													title={action.label}>
													{action.icon}
												</button>
											))}
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			)}

			<RiskAnalysisModal isOpen={isRiskModalOpen} onClose={() => setIsRiskModalOpen(false)} data={selectedRiskData} />

			{/* Logistics Modal */}
			{isLogisticsModalOpen && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg w-[400px] shadow-lg animate-page">
						<h3 className="text-lg font-bold mb-4">{t("logisticsShipment") || "Logistics Shipment"}</h3>
						<form onSubmit={handleLogisticsSubmit} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">{t("logisticsMode") || "Logistics Mode"}</label>
								<input type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={logisticsForm.logistics_mode} onChange={(e) => setLogisticsForm({ ...logisticsForm, logistics_mode: e.target.value })} placeholder={t("logisticsModeExample") || "e.g. DHL, FedEx"} required />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">{t("trackingNumber") || "Tracking Number"}</label>
								<input type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={logisticsForm.tracking_number} onChange={(e) => setLogisticsForm({ ...logisticsForm, tracking_number: e.target.value })} placeholder={t("trackingNumber") || "Tracking Number"} required />
							</div>
							<div className="flex justify-end gap-2 mt-6">
								<button type="button" onClick={() => setIsLogisticsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
									{t("cancel")}
								</button>
								<button type="submit" disabled={logisticsSaving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
									{logisticsSaving && <FontAwesomeIcon icon={faSpinner} spin />}
									{logisticsSaving ? t("saving") : t("confirm")}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
			<EmailTasksModal t={t} isOpen={emailTasksModalOpen} onClose={() => setEmailTasksModalOpen(false)} orderNo={selectedOrderNo} />
		</div>
	);
}
