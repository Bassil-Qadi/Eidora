import { FaWhatsapp, FaInstagram, FaFacebook } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useLanguage } from "../../hooks/useLanguage"

const Footer = () => {

  const { t } = useLanguage();

  return (
    <footer className="bg-gray-100 text-gray-900 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Brand */}
        <div>
          <h2 className="text-xl font-semibold">
            🌙 {t("footer.title")}
          </h2>
          <p className="mt-3 text-sm text-gray-700">
            {t("footer.subTitle")}
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="font-semibold mb-3">{t("footer.quickLinks")}</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-gray-600 transition">
                {t("footer.home")}
              </Link>
            </li>
            <li>
              <Link to="/editor" className="hover:text-gray-600 transition">
                {t("footer.createCard")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className="font-semibold mb-3">{t("footer.followUs")}</h3>
          <p className="text-sm text-gray-700 mb-3">
            {t("footer.followUsTitle")}
          </p>
          <div className="flex gap-4 text-sm">
            <FaWhatsapp className="text-green-500 cursor-pointer" />
            <FaInstagram className="text-pink-500 cursor-pointer" />
            <FaFacebook className="text-blue-600 cursor-pointer" />
          </div>
        </div>

      </div>

      {/* Bottom */}
      <div className="border-t border-gray-300 text-center py-4 text-sm text-gray-600">
        © {new Date().getFullYear()} {t("footer.copyright")}
      </div>
    </footer>
  )
}

export default Footer
