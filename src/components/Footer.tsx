import { useTranslation } from "react-i18next";
import { Logo } from "./Branding.tsx";
import { Link } from "react-router";
import { Building, Mail, Phone } from "lucide-react";
import { Button } from "@heroui/react";

import FacebookIcon from "../assets/facebook.svg";
import GithubIcon from "../assets/github.svg";

export default function Footer({ className }: { className?: string }) {
  const { t } = useTranslation();
  const sloganText = t("footer.slogan", "slogan");
  const officeAddressText = t(
    "footer.officeAddress",
    "123 Main Street, City, Country",
  );
  const followUsText = t("footer.followUsCapitalized", "FOLLOW US");
  const aboutUsText = t("footer.aboutUsCapitalized", "ABOUT US");
  const privacyPolicyText = t("footer.privacyPolicy", "Privacy Policy");
  const termsOfServiceText = t("footer.termsOfService", "Terms of Service");
  const linksText = t("footer.linksCapitalized", "LINKS");
  const supportText = t("footer.support", "Support");
  const copyrightText = t("footer.copyright", "Copyright");
  const serverStatusText = t("footer.serverStatus", "Server Status");

  // TODO: Replace these placeholders with actual data or fetch from an API
  const officeMapUrl = "https://maps.google.com/";
  const email = "ticketrush@june8th.me";
  const telephone = "+84 987654321";
  const facebookUrl = "https://facebook.com/company";
  const githubUrl = "https://github.com/im-yuuki/ticketrush";

  return (
    <footer className={className}>
      <div className="container mx-auto flex flex-col md:flex-row flex-wrap px-10 py-6 gap-10 md:gap-4">
        <div className="flex-2 flex flex-col">
          <div className="mb-4">
            <Logo height={40} accentColor={false} />
            <p className="text-muted">{sloganText}</p>
          </div>
          <table className="text-sm text-muted border-collapse">
            <tbody>
            <tr>
              <td className="w-0 pr-2 pb-1">
                <Building height={16} />
              </td>
              <td className="min-w-0 wrap-break-words pb-1">
                <Link
                  to={officeMapUrl}
                  target="_blank"
                  className="hover:text-foreground"
                >
                  {officeAddressText}
                </Link>
              </td>
            </tr>
            <tr>
              <td className="w-0 pr-2 pb-1">
                <Mail height={16} />
              </td>
              <Link to={`mailto:${email}`} className="hover:text-foreground">
                <td className="min-w-0 wrap-break-words pb-1">{email}</td>
              </Link>
            </tr>
            <tr>
              <td className="w-0 pr-2 pb-1">
                <Phone height={16} />
              </td>
              <Link to={`tel:${telephone}`} className="hover:text-foreground">
                <td className="min-w-0 wrap-break-words pb-1">{telephone}</td>
              </Link>
            </tr>
            </tbody>
          </table>
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <p className="font-bold mb-1">{aboutUsText}</p>
          <Link
            to="/privacy"
            className="text-sm text-muted hover:text-foreground"
          >
            {privacyPolicyText}
          </Link>
          <Link
            to="/terms"
            className="text-sm text-muted hover:text-foreground"
          >
            {termsOfServiceText}
          </Link>
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <p className="font-bold  mb-1">{linksText}</p>
          <Link to="#" className="text-sm text-muted hover:text-foreground">
            {supportText}
          </Link>
          <Link to="#" className="text-sm text-muted hover:text-foreground">
            {serverStatusText}
          </Link>
          <p className="font-bold mt-4 mb-1">{followUsText}</p>
          <div className="flex gap-2">
            <Link to={facebookUrl} target="_blank">
              <Button variant="tertiary" isIconOnly={true}>
                <img
                  src={FacebookIcon}
                  className="footer-social-icon size-4"
                  alt="Facebook"
                />
              </Button>
            </Link>
            <Link to={githubUrl} target="_blank">
              <Button variant="tertiary" isIconOnly={true}>
                <img src={GithubIcon} className="footer-social-icon size-4" alt="GitHub" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <p className="border-t border-border px-10 py-2 text-center text-sm text-muted">
        {copyrightText}
      </p>
    </footer>
  );
}
