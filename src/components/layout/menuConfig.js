import { faStripeS, faStripe } from "@fortawesome/free-brands-svg-icons";
import {
	faTachometerAlt,
	faClipboardList,
	faUsers,
	faCreditCard,
	faBan,
	faLayerGroup,
	faUnlock,
	faShieldAlt,
	faEnvelope,
	faList,
	faFileAlt,
	faServer,
	faTasks,
} from "@fortawesome/free-solid-svg-icons";

// Role mapping based on juese_id
export const ROLE_MAP = {
	1: "super_admin",
	4: "admin",
	5: "cs",
	6: "adv",
};

/**
 * Menu Configuration
 * roles: allowed roles. If undefined or empty, allowed for all.
 */
export const MENU_CONFIG = [
	{
		path: "/dashboard",
		icon: faTachometerAlt,
		label: "dashboard",
		roles: ["super_admin", "admin", "adv", "cs"],
	},
	{
		path: "/orders",
		icon: faClipboardList,
		label: "orders",
		roles: ["super_admin", "admin", "adv", "cs"],
	},
	{
		path: "/stripe-accounts",
		label: "stripeAccounts",
		icon: faCreditCard,
		roles: ["super_admin", "admin"],
		children: [
			{
				path: "/stripe-accounts",
				icon: faStripe,
				label: "accountList",
				roles: ["super_admin", "admin"],
			},
			{
				path: "/stripe-whitelist-groups",
				icon: faUnlock,
				label: "stripeWhitelistGroups",
				roles: ["super_admin", "admin"],
			},
			{
				path: "/stripe-groups",
				icon: faLayerGroup,
				label: "accountGrouping",
				roles: ["super_admin", "admin"],
			},
		],
	},
	{
		path: "/users",
		icon: faUsers,
		label: "users",
		roles: ["super_admin", "admin"],
	},
	{
		path: "/blacklist",
		icon: faBan,
		label: "blacklist",
		roles: ["super_admin", "admin"],
	},
	{
		label: "emailManagement",
		icon: faEnvelope,
		roles: ["super_admin", "admin"],
		children: [
			{
				path: "/email/types",
				label: "emailTypeManagement",
				icon: faList,
				roles: ["super_admin", "admin"],
			},
			{
				path: "/email/templates",
				label: "emailTemplateManagement",
				icon: faFileAlt,
				roles: ["super_admin", "admin"],
			},
			{
				path: "/email/smtp",
				label: "smtpServerManagement",
				icon: faServer,
				roles: ["super_admin", "admin"],
			},
			{
				path: "/email/tasks",
				label: "emailTaskManagement",
				icon: faTasks,
				roles: ["super_admin", "admin"],
			},
		],
	},
];

export const DEV_MENU_ITEM = {
	path: "/roles",
	icon: faShieldAlt,
	label: "roleManagement",
	roles: ["super_admin", "admin"],
};
