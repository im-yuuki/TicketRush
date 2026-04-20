import { Button } from "@heroui/react";
import { House } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

export default function NotFound() {
  const { t } = useTranslation();
  const description = t("notFound.description");
  const backToHome = t("notFound.backToHome");

  return (
    <div className="flex min-h-screen flex-col gap-4 items-center justify-center text-center">
      <h1 className="text-9xl font-extrabold text-muted">404</h1>
      <p className="text-muted">{description}</p>
      <Link to="/">
        <Button>
          <House />
          {backToHome}
        </Button>
      </Link>
    </div>
  );
}
