/**
 * Stripe Account Status Definitions
 */
export const StripeAccountStatus = {
	INACTIVE: 0,
	ACTIVE: 1,
	COMPLETED: 2,
	SUSPENDED: 3,
};

/**
 * Get Stripe Account Status Options
 * @param {Function} t - i18n translation function
 * @returns {Array} Array of status options with value, label, and color
 */
export const getStripeAccountStatusOptions = (t) => [
	{ value: StripeAccountStatus.INACTIVE, label: t("st_status_inactive") || "Inactive", color: "gray" },
	{ value: StripeAccountStatus.ACTIVE, label: t("st_status_active") || "Active", color: "green" },
	{ value: StripeAccountStatus.COMPLETED, label: t("st_status_completed") || "Completed", color: "blue" },
	{ value: StripeAccountStatus.SUSPENDED, label: t("st_status_suspended") || "Suspended", color: "red" },
];

/**
 * Get Status Info by Value
 * @param {Number} value - Status value
 * @param {Function} t - i18n translation function
 * @returns {Object} Status info object
 */
export const getStripeAccountStatusInfo = (value, t) => {
	const options = getStripeAccountStatusOptions(t);
	return options.find((opt) => opt.value === Number(value)) || { value, label: "Unknown", color: "gray" };
};
