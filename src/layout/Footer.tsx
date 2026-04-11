import { useTranslation } from "react-i18next";
import { Logo } from "../components/Branding";

export function Footer() {
    const { t } = useTranslation();
    const sloganText = t("footer.slogan", "slogan");
    const copyrightText = t("footer.copyright", "copyright");
    const companyText = t("footer.company", "company");
    const representativeText = t("footer.representative", "representative");
    const licenseText = t("footer.license", "license");


    return (
        <footer className="border-t-2 border-border bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="max-w-400 mx-auto flex items-center gap-3 px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex min-w-0 flex-1 justify-start">
                    <Logo height={40} />
                </div>
                <div className="flex min-w-0 shrink flex-col gap-1 text-center text-sm text-muted-foreground">
                    <p>{sloganText}</p>
                    <p>{copyrightText}</p>
                    <p>
                        {companyText} - {representativeText}
                    </p>
                    <p>{licenseText}</p>
                </div>
                <div className="flex-1" aria-hidden="true" />
            </div>
        </footer>
    );
}
