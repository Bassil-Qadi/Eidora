import { AiOutlineMoon } from "react-icons/ai";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "../../hooks/useLanguage";

const Navbar = () => {
  const { t, isRTL } = useLanguage();
  return (
    <nav className="w-full border-b border-gray-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          {!isRTL ? (
            <AiOutlineMoon size={30} className="text-gold" />
          ) : (
            <div className="scale-x-[-1]">
              <AiOutlineMoon size={30} className="text-gold" />
            </div>
          )}

          <div>
            <h2 className="text-2xl font-semibold text-gold mb-0">
              {t("ramadan.title")}
            </h2>
            <small className="hidden sm:block">{t("ramadan.greeting")}</small>
          </div>
        </div>
        <LanguageSwitcher />
      </div>
    </nav>
  );
};

export default Navbar;
