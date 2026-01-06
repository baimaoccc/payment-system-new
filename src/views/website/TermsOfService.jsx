import React from "react";
import { useI18n } from "../../plugins/i18n";
import { useEffect } from "react";

export function TermsOfService() {
	const { t } = useI18n();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	return (
		<div className="pt-32 pb-20 bg-slate-50 min-h-screen">
			<div className="container mx-auto px-4 max-w-4xl">
				<div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 border border-slate-100">
					<h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t("legal.termsOfService.title")}</h1>
					<p className="text-slate-500 mb-12 pb-8 border-b border-slate-100">{t("legal.termsOfService.lastUpdated")}</p>

					<div className="space-y-12">
						<section>
							<p className="text-slate-600 leading-relaxed mb-6">{t("legal.termsOfService.intro")}</p>
						</section>

						<section>
							<h2 className="text-xl font-bold text-slate-900 mb-4">{t("legal.termsOfService.acceptance.title")}</h2>
							<p className="text-slate-600 leading-relaxed whitespace-pre-line">{t("legal.termsOfService.acceptance.content")}</p>
						</section>

						<section>
							<h2 className="text-xl font-bold text-slate-900 mb-4">{t("legal.termsOfService.services.title")}</h2>
							<p className="text-slate-600 leading-relaxed whitespace-pre-line">{t("legal.termsOfService.services.content")}</p>
						</section>

						<section>
							<h2 className="text-xl font-bold text-slate-900 mb-4">{t("legal.termsOfService.account.title")}</h2>
							<p className="text-slate-600 leading-relaxed whitespace-pre-line">{t("legal.termsOfService.account.content")}</p>
						</section>

						<section>
							<h2 className="text-xl font-bold text-slate-900 mb-4">{t("legal.termsOfService.prohibited.title")}</h2>
							<p className="text-slate-600 leading-relaxed whitespace-pre-line">{t("legal.termsOfService.prohibited.content")}</p>
						</section>

						<section>
							<h2 className="text-xl font-bold text-slate-900 mb-4">{t("legal.termsOfService.termination.title")}</h2>
							<p className="text-slate-600 leading-relaxed whitespace-pre-line">{t("legal.termsOfService.termination.content")}</p>
						</section>

						<section>
							<h2 className="text-xl font-bold text-slate-900 mb-4">{t("legal.termsOfService.liability.title")}</h2>
							<p className="text-slate-600 leading-relaxed whitespace-pre-line">{t("legal.termsOfService.liability.content")}</p>
						</section>
					</div>
				</div>
			</div>
		</div>
	);
}
