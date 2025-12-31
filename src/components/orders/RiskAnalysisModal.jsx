import React from "react";
import { useI18n } from "../../plugins/i18n/index.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faTimes, 
    faShieldAlt, 
    faUserCircle, 
    faGlobeAmericas, 
    faEnvelope, 
    faUser, 
    faPhone, 
    faMapMarkerAlt, 
    faNetworkWired, 
    faMapPin, 
    faCompass, 
    faServer, 
    faRoute, 
    faDesktop,
    faCreditCard,
    faMoneyBillWave,
    faCheckCircle,
    faTimesCircle,
    faShieldVirus,
    faWallet,
    faClock,
    faBuilding,
    faFingerprint
} from "@fortawesome/free-solid-svg-icons";

export function RiskAnalysisModal({ isOpen, onClose, data }) {
	const { t } = useI18n();

	if (!isOpen || !data) return null;

	const { riskScore, customer, checkout, payment } = data;

	// Determine risk color based on score (mock logic)
	const getRiskColor = (score) => {
		if (score < 65) return "text-yellow-500 bg-yellow-100";
		if (score < 75) return "text-orange-500 bg-orange-100";
		return "text-red-500 bg-red-100";
	};
    
    const riskBadgeColor = riskScore < 65 ? "bg-yellow-400" : riskScore < 75 ? "bg-orange-500" : "bg-red-600";


	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* Backdrop */}
			<div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

			{/* Modal Content */}
			<div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10 m-4 animate-in fade-in zoom-in duration-200">
				{/* Close Button */}
				<button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
					<FontAwesomeIcon icon={faTimes} className="text-lg" />
				</button>

				<div className="p-6">
					{/* Header Risk Score */}
					<div className="flex flex-col items-center justify-center mb-8">
						<div className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
							<FontAwesomeIcon icon={faShieldAlt} className={riskScore < 65 ? "text-yellow-500" : riskScore < 75 ? "text-orange-500" : "text-red-600"} />
							{t("normalRisk")}
							<span className={`flex items-center justify-center w-8 h-8 text-sm font-bold text-white rounded-full ${riskBadgeColor}`}>
								{riskScore}
							</span>
						</div>

						{/* Risk Bar */}
						<div className="w-full max-w-md">
							<div className="relative h-2 rounded-full w-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-600">
                                {/* Indicator */}
                                <div 
                                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-600 rounded-full shadow transform transition-all duration-500"
                                    style={{ left: `${riskScore}%` }}
                                />
                            </div>
							<div className="flex justify-between text-xs text-gray-500 mt-1 font-medium">
								<span>0</span>
								<span>5</span>
								<span className="ml-auto mr-8">65</span>
								<span className="mr-4">75</span>
								<span>100</span>
							</div>
						</div>

						<p className="text-center text-gray-600 mt-6 max-w-lg">
							{t("riskScoreExplanation")}
						</p>
					</div>

					<div className="flex flex-col gap-8">
						{/* Customer Details */}
						<div>
							<h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                                <FontAwesomeIcon icon={faUserCircle} className="text-blue-600" />
                                {t("customerDetails")}
                            </h3>
							<div className="space-y-4">
								<div className="grid grid-cols-[1fr,1.5fr] gap-2">
									<div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                        <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 w-4 text-center" />
                                        {t("customerEmail")}
                                    </div>
									<span className="text-gray-900 text-sm break-all">{customer.email}</span>
								</div>
								<div className="grid grid-cols-[1fr,1.5fr] gap-2">
									<div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                        <FontAwesomeIcon icon={faUser} className="text-gray-400 w-4 text-center" />
                                        {t("name")}
                                    </div>
									<span className="text-gray-900 text-sm">{customer.name}</span>
								</div>
								<div className="grid grid-cols-[1fr,1.5fr] gap-2">
									<div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                        <FontAwesomeIcon icon={faPhone} className="text-gray-400 w-4 text-center" />
                                        {t("phone")}
                                    </div>
									<span className="text-gray-900 text-sm">{customer.phone}</span>
								</div>
								<div className="grid grid-cols-[1fr,1.5fr] gap-2">
									<div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400 w-4 text-center" />
                                        {t("billingAddress")}
                                    </div>
									<span className="text-gray-900 text-sm">{customer.billingAddress}</span>
								</div>
							</div>
						</div>

						{/* Payment Details */}
						{payment && (
							<div>
								<h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
									<FontAwesomeIcon icon={faCreditCard} className="text-purple-600" />
									{t("paymentDetails")}
								</h3>
								<div className="space-y-4">
									<div className="grid grid-cols-[1fr,1.5fr] gap-2">
										<div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
											<FontAwesomeIcon icon={faCreditCard} className="text-gray-400 w-4 text-center" />
											{t("cardBrand")}
										</div>
										<span className="text-gray-900 text-sm capitalize">{payment.brand} {payment.last4 ? `•••• ${payment.last4}` : ""}</span>
									</div>
                                    {payment.type && (
                                        <div className="grid grid-cols-[1fr,1.5fr] gap-2">
                                            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                                <FontAwesomeIcon icon={faCreditCard} className="text-gray-400 w-4 text-center" />
                                                {t("paymentType")}
                                            </div>
                                            <span className="text-gray-900 text-sm capitalize">{payment.type}</span>
                                        </div>
                                    )}
                                    {payment.network && (
                                        <div className="grid grid-cols-[1fr,1.5fr] gap-2">
                                            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                                <FontAwesomeIcon icon={faCreditCard} className="text-gray-400 w-4 text-center" />
                                                {t("network")}
                                            </div>
                                            <span className="text-gray-900 text-sm capitalize">{payment.network}</span>
                                        </div>
                                    )}
									<div className="grid grid-cols-[1fr,1.5fr] gap-2">
										<div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
											<FontAwesomeIcon icon={faMoneyBillWave} className="text-gray-400 w-4 text-center" />
											{t("fundingType")}
										</div>
										<span className="text-gray-900 text-sm capitalize">{payment.funding}</span>
									</div>
                                    {payment.amountAuthorized && (
                                        <div className="grid grid-cols-[1fr,1.5fr] gap-2">
                                            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                                <FontAwesomeIcon icon={faMoneyBillWave} className="text-gray-400 w-4 text-center" />
                                                {t("amountAuthorized")}
                                            </div>
                                            <span className="text-gray-900 text-sm">{(payment.amountAuthorized / 100).toFixed(2)}</span>
                                        </div>
                                    )}
                                    {/* {payment.authorizationCode && (
                                        <div className="grid grid-cols-[1fr,1.5fr] gap-2">
                                            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                                <FontAwesomeIcon icon={faCheckCircle} className="text-gray-400 w-4 text-center" />
                                                {t("authCode")}
                                            </div>
                                            <span className="text-gray-900 text-sm">{payment.authorizationCode}</span>
                                        </div>
                                    )} */}
									<div className="grid grid-cols-[1fr,1.5fr] gap-2">
										<div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
											<FontAwesomeIcon icon={faGlobeAmericas} className="text-gray-400 w-4 text-center" />
											{t("cardCountry")}
										</div>
										<span className="text-gray-900 text-sm">{payment.country}</span>
									</div>
                                    {payment.fingerprint && (
                                        <div className="grid grid-cols-[1fr,1.5fr] gap-2">
                                            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                                <FontAwesomeIcon icon={faFingerprint} className="text-gray-400 w-4 text-center" />
                                                {t("fingerprint")}
                                            </div>
                                            <span className="text-gray-900 text-xs text-gray-500 break-all">{payment.fingerprint}</span>
                                        </div>
                                    )}
									<div className="grid grid-cols-[1fr,1.5fr] gap-2">
										<div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
											<FontAwesomeIcon icon={faCheckCircle} className="text-gray-400 w-4 text-center" />
											{t("cvcCheck")}
										</div>
										<div className="flex items-center gap-2">
											<span className={`text-sm font-medium ${payment.cvcCheck === "pass" ? "text-green-600" : "text-red-600"}`}>
												{payment.cvcCheck === "pass" ? <FontAwesomeIcon icon={faCheckCircle} /> : <FontAwesomeIcon icon={faTimesCircle} />}
												<span className="ml-1 capitalize">{payment.cvcCheck}</span>
											</span>
										</div>
									</div>
                                    {payment.addressCheck && (
                                        <div className="grid grid-cols-[1fr,1.5fr] gap-2">
                                            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400 w-4 text-center" />
                                                {t("addressCheck")}
                                            </div>
                                            <span className={`text-sm font-medium ${payment.addressCheck === "pass" ? "text-green-600" : "text-red-600"}`}>
                                                {payment.addressCheck === "pass" ? <FontAwesomeIcon icon={faCheckCircle} /> : <FontAwesomeIcon icon={faTimesCircle} />}
                                                <span className="ml-1 capitalize">{payment.addressCheck}</span>
                                            </span>
                                        </div>
                                    )}
                                    {payment.zipCheck && (
                                        <div className="grid grid-cols-[1fr,1.5fr] gap-2">
                                            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                                <FontAwesomeIcon icon={faMapPin} className="text-gray-400 w-4 text-center" />
                                                {t("zipCheck")}
                                            </div>
                                            <span className={`text-sm font-medium ${payment.zipCheck === "pass" ? "text-green-600" : "text-red-600"}`}>
                                                {payment.zipCheck === "pass" ? <FontAwesomeIcon icon={faCheckCircle} /> : <FontAwesomeIcon icon={faTimesCircle} />}
                                                <span className="ml-1 capitalize">{payment.zipCheck}</span>
                                            </span>
                                        </div>
                                    )}
									<div className="grid grid-cols-[1fr,1.5fr] gap-2">
										<div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
											<FontAwesomeIcon icon={faShieldVirus} className="text-gray-400 w-4 text-center" />
											{t("threeDSecure")}
										</div>
										<span className="text-gray-900 text-sm capitalize">{payment.threeDSecure || "-"}</span>
									</div>
                                    {payment.wallet && (
                                        <div className="grid grid-cols-[1fr,1.5fr] gap-2">
                                            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                                <FontAwesomeIcon icon={faWallet} className="text-gray-400 w-4 text-center" />
                                                {t("wallet")}
                                            </div>
                                            <span className="text-gray-900 text-sm capitalize">{payment.wallet}</span>
                                        </div>
                                    )}
                                    {payment.networkTransactionId && (
                                        <div className="grid grid-cols-[1fr,1.5fr] gap-2">
                                            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                                <FontAwesomeIcon icon={faGlobeAmericas} className="text-gray-400 w-4 text-center" />
                                                {t("networkTransactionId")}
                                            </div>
                                            <span className="text-gray-900 text-xs text-gray-500 break-all">{payment.networkTransactionId}</span>
                                        </div>
                                    )}
								</div>
							</div>
						)}

						{/* Checkout Details */}
						<div>
							<h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
								<FontAwesomeIcon icon={faGlobeAmericas} className="text-green-600" />
								{t("checkoutDetails")}
							</h3>
							<div className="space-y-4">
                                {checkout.ip && (
                                    <div className="grid grid-cols-[1fr,1.5fr] gap-2">
                                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                            <FontAwesomeIcon icon={faNetworkWired} className="text-gray-400 w-4 text-center" />
                                            {t("ipAddress")}
                                        </div>
                                        <span className="text-gray-900 text-sm">{checkout.ip}</span>
                                    </div>
                                )}
                                {checkout.hostname && (
                                    <div className="grid grid-cols-[1fr,1.5fr] gap-2">
                                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                            <FontAwesomeIcon icon={faServer} className="text-gray-400 w-4 text-center" />
                                            {t("hostname")}
                                        </div>
                                        <span className="text-gray-900 text-sm">{checkout.hostname}</span>
                                    </div>
                                )}
                                {checkout.city && (
                                    <div className="grid grid-cols-[1fr,1.5fr] gap-2">
                                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400 w-4 text-center" />
                                            {t("city")}
                                        </div>
                                        <span className="text-gray-900 text-sm">{checkout.city}</span>
                                    </div>
                                )}
                                {checkout.region && (
                                    <div className="grid grid-cols-[1fr,1.5fr] gap-2">
                                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                            <FontAwesomeIcon icon={faMapPin} className="text-gray-400 w-4 text-center" />
                                            {t("region")}
                                        </div>
                                        <span className="text-gray-900 text-sm">{checkout.region}</span>
                                    </div>
                                )}
                                {checkout.country && (
                                    <div className="grid grid-cols-[1fr,1.5fr] gap-2">
                                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                            <FontAwesomeIcon icon={faGlobeAmericas} className="text-gray-400 w-4 text-center" />
                                            {t("country")}
                                        </div>
                                        <span className="text-gray-900 text-sm">{checkout.country}</span>
                                    </div>
                                )}
                                {checkout.postal && (
                                    <div className="grid grid-cols-[1fr,1.5fr] gap-2">
                                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                            <FontAwesomeIcon icon={faMapPin} className="text-gray-400 w-4 text-center" />
                                            {t("postalCode")}
                                        </div>
                                        <span className="text-gray-900 text-sm">{checkout.postal}</span>
                                    </div>
                                )}
                                {checkout.loc && (
                                    <div className="grid grid-cols-[1fr,1.5fr] gap-2">
                                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                            <FontAwesomeIcon icon={faCompass} className="text-gray-400 w-4 text-center" />
                                            {t("location")}
                                        </div>
                                        <span className="text-gray-900 text-sm">{checkout.loc}</span>
                                    </div>
                                )}
                                {checkout.org && (
                                    <div className="grid grid-cols-[1fr,1.5fr] gap-2">
                                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                            <FontAwesomeIcon icon={faBuilding} className="text-gray-400 w-4 text-center" />
                                            {t("organization")}
                                        </div>
                                        <span className="text-gray-900 text-sm">{checkout.org}</span>
                                    </div>
                                )}
                                {checkout.timezone && (
                                    <div className="grid grid-cols-[1fr,1.5fr] gap-2">
                                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                            <FontAwesomeIcon icon={faClock} className="text-gray-400 w-4 text-center" />
                                            {t("timezone")}
                                        </div>
                                        <span className="text-gray-900 text-sm">{checkout.timezone}</span>
                                    </div>
                                )}
                                {checkout.vpn && (
                                    <div className="grid grid-cols-[1fr,1.5fr] gap-2">
                                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                            <FontAwesomeIcon icon={faShieldAlt} className="text-gray-400 w-4 text-center" />
                                            {t("vpn")}
                                        </div>
                                        <span className="text-gray-900 text-sm">{checkout.vpn}</span>
                                    </div>
                                )}
                                {checkout.proxy && (
                                    <div className="grid grid-cols-[1fr,1.5fr] gap-2">
                                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                            <FontAwesomeIcon icon={faRoute} className="text-gray-400 w-4 text-center" />
                                            {t("proxy")}
                                        </div>
                                        <span className="text-gray-900 text-sm">{checkout.proxy}</span>
                                    </div>
                                )}
                                {checkout.userAgent && (
                                    <div className="grid grid-cols-[1fr,1.5fr] gap-2">
                                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                            <FontAwesomeIcon icon={faDesktop} className="text-gray-400 w-4 text-center" />
                                            {t("userAgent")}
                                        </div>
                                        <span className="text-gray-900 text-xs text-gray-500 break-words leading-tight">{checkout.userAgent}</span>
                                    </div>
                                )}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
