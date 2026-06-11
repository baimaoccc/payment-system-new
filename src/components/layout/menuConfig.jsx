import React from "react";
import { faStripeS, faStripe, faAlipay, faCcStripe } from "@fortawesome/free-brands-svg-icons";
import { faTachometerAlt, faClipboardList, faUsers, faCreditCard, faBan, faLayerGroup, faUnlock, faShieldAlt, faEnvelope, faList, faFileAlt, faServer, faTasks, faTv, faBox, faGlobe, faWallet, faMoneyCheckAlt, faUniversity } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import stripeIcon from "../../assets/stripe-icon.jpg";
import zelleLogo from "../../assets/zelle-logo-white.webp";
import brandLogo from "../../assets/brand-logo.png";
// Note: You can replace these image paths with actual icons if you have them in the assets folder.
// Using default SVGs or standard icons as placeholders for airwallex, citcon, zelle if images aren't present.


// Helper icon components for custom brands
const CustomIcon = ({ src, alt, isBase64 }) => (
  <img src={src} alt={alt} className="w-5 h-5 object-contain grayscale hover:opacity-100 transition-opacity" />
);

const AirwallexSVG = () => (
  <svg className="w-5 h-5 grayscale hover:opacity-100 transition-opacity" viewBox="0 0 40 40" fill="currentColor">
    <path d="M34.614 9.421a4.452 4.452 0 0 1 1.057 4.77l-2.347 6.376c-.616 1.674-2.02 2.969-3.755 3.307a4.882 4.882 0 0 1-4.732-1.69L10.763 5.322a.31.31 0 0 0-.528.093L5.656 17.8c-.095.256.157.504.407.402l5.619-2.295a2.481 2.481 0 0 1 3.296 1.546c.415 1.273-.283 2.648-1.512 3.15L6.126 23.6c-1.359.555-2.92.457-4.144-.36a4.461 4.461 0 0 1-1.704-5.26l5.41-14.628C6.329 1.618 7.789.394 9.594.078a5.025 5.025 0 0 1 4.768 1.755l8.078 9.68 7.43-3.035c1.651-.674 3.469-.313 4.744.943zm-4.285 4.862c.094-.256-.158-.504-.408-.401l-4.105 1.676 2.462 2.951a.31.31 0 0 0 .53-.093l1.52-4.133z"></path>
  </svg>
);

const CitconSVG = () => <CustomIcon src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAA7UlEQVR4AWJwL/AhiKWTvgF6LYMbhkEYivbUI2OwQYbIAEjZhQkyE4swABswALUqHyKrir8q5x/eJQI/cDA4C1VowhCmMvRbFTISyxMVDbpAhlAQoRUlocMig85NrlBlm7CC2Gx8RxYvtWlcD5F+CfuDwn4R6mnEJp5CtuUCzi0XoXv0G1CrzSuZr1BXCcnMzvIf0vzyUmIC7sI0Y6oZM2/iVW9VJ1gyVXe9O/Ga/j+3hpxxMMNLQVLZO6g8JipMkUI0pTMqpeih2SMODb0s6IVPvdrYl/dBfZ7oDzC1xaA2UdQ2kdUIH3cx6a3+B5yPKcogZhWQAAAAAElFTkSuQmCC" alt="Citcon" />;
const ZelleSVG = () => <CustomIcon src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAgVBMVEVvH9RtG9R0KtWAO9l/NNhqENKshOPXw/LCp+tkANDIsOv////o4fd3ItXNte3Pue7+/f/59v15N9Z7PNZtGtT07/qMU9ihd92dcty/n+fl1/bEq+rZyfGBQte4muaPWdnRve3m2/Wwi+a4lOaZaN+dbuGXY+Dv5vpuHMl1LMuESNTozOBjAAAAx0lEQVR4AYySBRLDIAAEIY27u3vy/wf2MlIhujg7OOQxFJw67vXiz6wgSpIsnEypqJqmKwdTU8LzhglpoNwtZ9mOY2ua7QCXMlLSvng+I00n2NBA4LKrhhGIEzhHJCy+IAgKTbFqxtGj0wgWBuaFTw5QShtnqY5dHGDBSDhyQqVjwVI5cr6XY8H60FEug2uEjf2irQPZ9QMY2YFuAGdPALiUWVE7vts7CeZlmS3cwVZe/QRyhNCljaWQE5Z19Sg5w/cpeY8qAAALgw8n/1cNtwAAAABJRU5ErkJggg==" alt="Zelle" />;
const StripeSVG = () => <CustomIcon src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAM1BMVEVHcExTOv1TOv1TOv1QNf1KLv1FJf0+Gf1+b/5tWv2elP7Oyf/n5P////+rov6QhP65sf4/usZVAAAAA3RSTlMATNu3u8+LAAAAdUlEQVR4AeTRtQHAMBAEQTE+9d+sIDJT7A1vwlNKG3ua0cPsZVqZazTK3vQdnTtH50MMKbkDTsilAiL5Nc7dsgDOdugyVZydoSfE/2GV7M4QhG0MftoGoZYcgveHP11KoQ+hASGJiF7KkwkC4E2aeBM13uwAAF8sEUFGFS8JAAAAAElFTkSuQmCC" alt="Stripe" />;

// Role mapping based on juese_id
export const ROLE_MAP = {
	1: "super_admin",
	4: "admin",
	5: "cs",
	6: "adv",
};

// Helper functions for role checking
export const isSuperAdmin = (role) => role === "super_admin";
export const isAdmin = (role) => role === "admin" || role === "super_admin"; // Includes super_admin for convenience
export const isStrictAdmin = (role) => role === "admin";
export const isCS = (role) => role === "cs";
export const isAdv = (role) => role === "adv";
export const isMerchant = (role) => role === "merchant";

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
		icon: StripeSVG,
		isCustomIcon: true,
		roles: ["super_admin", "admin"],
		children: [
			{
				path: "/stripe-accounts",
				icon: StripeSVG,
				isCustomIcon: true,
				label: "accountList",
				roles: ["super_admin", "admin"],
			},
		],
	},
	{
		path: "/airwallex-accounts",
		label: "airwallexAccounts",
		icon: AirwallexSVG,
		isCustomIcon: true,
		roles: ["super_admin"],
		children: [
			{
				path: "/airwallex-accounts",
				icon: AirwallexSVG,
				isCustomIcon: true,
				label: "accountList",
				roles: ["super_admin"],
			},
		],
	},
	{
		path: "/citcon-accounts",
		label: "citconAccounts",
		icon: CitconSVG,
		isCustomIcon: true,
		roles: ["super_admin"],
		children: [
			{
				path: "/citcon-accounts",
				icon: CitconSVG,
				isCustomIcon: true,
				label: "accountList",
				roles: ["super_admin"],
			},
		],
	},
	{
		path: "/zelle-accounts",
		label: "zelleAccounts",
		icon: ZelleSVG,
		isCustomIcon: true,
		roles: ["super_admin"],
		children: [
			{
				path: "/zelle-accounts",
				icon: ZelleSVG,
				isCustomIcon: true,
				label: "accountList",
				roles: ["super_admin"],
			},
		],
	},
	{
		label: "configManagement",
		icon: faLayerGroup,
		roles: ["super_admin", "admin"],
		children: [
			{
				path: "/stripe-groups",
				icon: faLayerGroup,
				label: "accountGrouping",
				roles: ["super_admin", "admin"],
			},
			{
				path: "/stripe-whitelist-groups",
				icon: faUnlock,
				label: "whitelistManagement",
				roles: ["super_admin", "admin"],
			}
		],
	},
	{
		path: "/users",
		icon: faUsers,
		label: "users",
		roles: ["super_admin", "admin", "adv"],
	},
	{
		path: "/blacklist",
		icon: faBan,
		label: "blacklist",
		roles: ["super_admin", "admin"],
	},
	{
		path: "/logs",
		icon: faFileAlt,
		label: "logManagement",
		roles: ["super_admin", "admin"],
	},
	{
		path: "/country-transfers",
		icon: faGlobe,
		label: "countryTransferManagement",
		roles: ["super_admin"],
	},
	{
		label: "bSiteManagement",
		icon: faTv, // Using faTv as a placeholder for BSite, you might need to import it
		roles: ["super_admin", "admin", "adv"],
		children: [
			{
				path: "/bSite/categories",
				label: "productCategory",
				icon: faList,
				roles: ["super_admin", "admin"],
			},
			{
				path: "/bSite/products",
				label: "bSiteProduct",
				icon: faBox, // Using faBox as placeholder
				roles: ["super_admin", "admin"],
			},
			{
				path: "/bSite/websites",
				label: "websiteManagement",
				icon: faGlobe,
				roles: ["super_admin", "admin", "adv"],
			},
		],
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
			// {
			// 	path: "/email/smtp",
			// 	label: "smtpServerManagement",
			// 	icon: faServer,
			// 	roles: ["super_admin", "admin"],
			// },
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
