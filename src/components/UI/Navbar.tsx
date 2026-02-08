import { AiOutlineMoon } from "react-icons/ai";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "../../hooks/useLanguage";

const Navbar = () => {
  const { t, isRTL } = useLanguage();
  return (
    <nav className="w-full border-b border-gray-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="h-full flex items-center">
        <img src="/Eidora-logo.png" alt="logo" className="w-32 h-32 object-contain" />
        </div>
        <LanguageSwitcher />
      </div>
    </nav>
  );
};

export default Navbar;
