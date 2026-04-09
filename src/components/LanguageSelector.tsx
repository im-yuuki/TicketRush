import { useEffect, useState, type Key } from "react";
import { useTranslation } from "react-i18next";
import { Button, Dropdown } from "@heroui/react";
import { languageOptions, changeLanguage, getCurrentLanguage } from "../i18n";

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(getCurrentLanguage());

  function handleLanguageChange(key: Key) {
    const selectedLanguage = changeLanguage(key.toString());
    if (selectedLanguage) setLanguage(selectedLanguage);
  }

  useEffect(() => {
    document.body.dir = i18n.dir();
  }, [i18n, i18n.language]);

  return (
    <Dropdown>
      <Button variant="tertiary">
        {language.icon}
        <span className="hidden lg:inline">{language.name}</span>
      </Button>
      <Dropdown.Popover>
        <Dropdown.Menu onAction={handleLanguageChange}>
          {languageOptions.map((option) => (
            <Dropdown.Item id={option.code} key={option.code}>
              {option.icon} {option.name}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
};

export default LanguageSelector;
