import { useTranslation } from "react-i18next";
import { Logo } from "../components/Branding";
import { Link } from "react-router";

export default function Footer({ className }: { className?: string }) {
  const { t } = useTranslation();
  const sloganText = t("footer.slogan", "slogan");
  const copyrightText = t("footer.copyright", "copyright");
  const aboutUsText = t("footer.aboutUs", "About Us");
  const privacyPolicyText = t("footer.privacyPolicy", "Privacy Policy");
  const termsOfServiceText = t("footer.termsOfService", "Terms of Service");
  const linksText = t("footer.links", "Links");
  const supportText = t("footer.support", "Support");

  return (
    <footer className={className}>
      <div className="container mx-auto flex flex-col md:flex-row flex-wrap px-10 py-6 gap-10 md:gap-4">
        <div className="flex-2 flex flex-col">
          <Logo height={40} />
          <p className="text-muted">{sloganText}</p>
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <p className="text-lg font-bold mb-1">{aboutUsText}</p>
          <Link to="/privacy" className="text-sm text-muted hover:text-foreground">
            {privacyPolicyText}
          </Link>
          <Link to="/terms" className="text-sm text-muted hover:text-foreground">
            {termsOfServiceText}
          </Link>
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <p className="text-lg font-bold mb-1">{linksText}</p>
          <Link to="#" className="text-sm text-muted hover:text-foreground">
            {supportText}
          </Link>
        </div>
      </div>
      <p className="border-t border-border px-10 py-2 text-center text-sm text-muted">{copyrightText}</p>
    </footer>
  );
}
