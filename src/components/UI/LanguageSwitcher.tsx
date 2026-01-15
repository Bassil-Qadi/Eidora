import { MdGTranslate } from "react-icons/md";
import { useLanguage } from '../../hooks/useLanguage';

export const LanguageSwitcher = () => {
  const { currentLanguage, changeLanguage } = useLanguage();

  return (
    <div className="flex items-center bg-gray-100 rounded-full p-1 justify-between select-none">
      <button
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full focus:outline-none transition-colors duration-200 ${
          currentLanguage === 'en' ? 'bg-gold text-white' : 'text-gray-700'
        }`}
        onClick={() => changeLanguage('en')}
        aria-label="Switch to English"
      >
        <MdGTranslate />
        English
      </button>
      <button
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full focus:outline-none transition-colors duration-200 ${
          currentLanguage === 'ar' ? 'bg-gold text-white' : 'text-gray-700'
        }`}
        onClick={() => changeLanguage('ar')}
        aria-label="Switch to Arabic"
      >
        <MdGTranslate />
        العربية
      </button>
    </div>
  );
};
