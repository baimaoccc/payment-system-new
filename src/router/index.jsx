import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { LoginView } from "../views/login/LoginView.jsx";
import { OrdersView } from "../views/orders/OrdersView.jsx";
import { StripeAccountsView } from "../views/stripe/StripeAccountsView.jsx";
import { StripeLogsView } from "../views/stripe/StripeLogsView.jsx";
import StripeWhitelistGroupsView from "../views/stripe/StripeWhitelistGroupsView.jsx";
import StripeGroupsView from "../views/stripe/StripeGroupsView.jsx";
import { UsersView } from "../views/users/UsersView.jsx";
import { RolesView } from "../views/roles/RolesView.jsx";
import { EmailTypeView } from "../views/email/EmailTypeView.jsx";
import { EmailTemplateView } from "../views/email/EmailTemplateView.jsx";
import { EmailTaskView } from "../views/email/EmailTaskView.jsx";
import { SmtpServerView } from "../views/email/SmtpServerView.jsx";
import OrderDetailsView from "../views/orders/OrderDetailsView.jsx";
import { OfficialSiteLayout } from "../components/layout/OfficialSiteLayout.jsx";
import { LandingPage } from "../views/website/LandingPage.jsx";
import { PrivacyPolicy } from "../views/website/PrivacyPolicy.jsx";
import { TermsOfService } from "../views/website/TermsOfService.jsx";
import { CookiePolicy } from "../views/website/CookiePolicy.jsx";
import { GuardedRoute } from "../components/common/GuardedRoute.jsx";
import { AppLayout } from "../components/layout/AppLayout.jsx";
import { DashboardView } from "../views/dashboard/DashboardView.jsx";
import { BlacklistView } from "../views/blacklist/BlacklistView.jsx";

/**
 * 中文：应用路由配置；受保护路由需登录与权限
 * English: App route config; protected routes require login and permissions
 */
export function AppRouter() {
	return (
		<Routes>
			<Route path="/login" element={<LoginView />} />

			{/* Official Website Routes */}
			<Route path="/website" element={<OfficialSiteLayout />}>
				<Route index element={<LandingPage />} />
				<Route path="privacy-policy" element={<PrivacyPolicy />} />
				<Route path="terms-of-service" element={<TermsOfService />} />
				<Route path="cookie-policy" element={<CookiePolicy />} />
			</Route>

			<Route
				path="/"
				element={
					<GuardedRoute>
						<AppLayout />
					</GuardedRoute>
				}>
				<Route index element={<Navigate to="/dashboard" replace />} />
				<Route path="dashboard" element={<DashboardView />} />
				<Route path="orders" element={<OrdersView />} />
				<Route path="orders/:id" element={<OrderDetailsView />} />
				<Route path="stripe-accounts" element={<StripeAccountsView />} />
				<Route path="stripe-whitelist-groups" element={<StripeWhitelistGroupsView />} />
				<Route path="stripe-groups" element={<StripeGroupsView />} />
				<Route path="users" element={<UsersView />} />
				<Route path="roles" element={<RolesView />} />
				<Route path="blacklist" element={<BlacklistView />} />
				<Route path="email/types" element={<EmailTypeView />} />
				<Route path="email/templates" element={<EmailTemplateView />} />
				<Route path="email/tasks" element={<EmailTaskView />} />
				<Route path="email/smtp" element={<SmtpServerView />} />
			</Route>

			<Route path="*" element={<Navigate to="/dashboard" replace />} />
		</Routes>
	);
}
