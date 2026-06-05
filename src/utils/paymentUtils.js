
/**
 * 获取 Payment Type 选项列表
 * @param {Function} t - i18n 翻译函数
 * @returns {Array} 选项数组
 */
export const getPaymentTypeOptions = (t) => [
	{ value: 1, label: t("stripeCheckout") || "Stripe Checkout" },
	{ value: 0, label: t("stripeCustomEmbeddedForms") || "Stripe Custom embedded forms" },
	{ value: 2, label: t("stripeCheckout2") || "Stripe Checkout (2.0)" },
];
