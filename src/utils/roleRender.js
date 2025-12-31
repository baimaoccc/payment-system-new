export const ROLE_DEFINITIONS = [
	{ id: 1, key: "role_super_admin", color: "bg-red-500 text-white" },
	{ id: 4, key: "role_admin", color: "bg-blue-500 text-white" },
	{ id: 5, key: "role_cs", color: "bg-green-500 text-white" },
	{ id: 6, key: "role_adv", color: "bg-yellow-500 text-white" },
];

export const getRoleInfo = (id, t) => {
	const role = ROLE_DEFINITIONS.find((r) => r.id === Number(id));
	if (role) {
		return {
			label: t ? t(role.key) : role.key,
			className: role.color,
		};
	}
	return {
		label: t ? t("role_unknown") : "Unknown",
		className: "bg-gray-400 text-white",
	};
};
