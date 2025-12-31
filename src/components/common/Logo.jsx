import React from "react";
import LogoVertical from "../../assets/logo-vertical.png";
import BrandLogo from "../../assets/brand-logo.png";

/**
 * Logo 组件：显示品牌标识
 */
export function Logo({ size = 48, collapsed = false }) {
	return <img src={collapsed ? LogoVertical : BrandLogo} alt="logo" style={{ width: 'auto', height: collapsed ? size : size * 1.2 }} />;
}
