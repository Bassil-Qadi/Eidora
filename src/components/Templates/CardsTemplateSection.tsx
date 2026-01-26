import { motion } from "framer-motion";
import { HiOutlineMoon, HiOutlineSparkles } from "react-icons/hi2";
import { useLanguage } from "../../hooks/useLanguage";

const gold = "#d4af37";

interface CardsTemplateSectionProps {
  handleRedirect: () => void;
}

const CardTemplatesSection = ({ handleRedirect }: CardsTemplateSectionProps) => {

    const { t } = useLanguage();

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* Ramadan Card */}
          <motion.div
            whileHover={{ y: -6 }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative h-[420px] rounded-3xl overflow-hidden bg-white shadow-sm hover:shadow-xl"
          >
            {/* Soft Gold Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#fff9e6] via-white to-[#fdf6dc]" />

            {/* Pattern */}
            <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,#d4af37_1px,transparent_1px)] [background-size:30px_30px]" />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-end p-8">
              <HiOutlineMoon size={34} color={gold} className="mb-4" />

              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                {t("cardTemplates.ramadanTemplates.title")}
              </h3>

              <p className="text-sm text-gray-600 mb-6 max-w-sm">
                {t("cardTemplates.ramadanTemplates.description")}
              </p>

              <button
                className="self-start px-7 py-3 rounded-xl font-medium transition border"
                style={{
                  borderColor: gold,
                  color: gold,
                }}
                onClick={() => handleRedirect()}
              >
                {t("cardTemplates.ramadanTemplates.buttonText")}
              </button>
            </div>
          </motion.div>

          {/* Eid Card */}
          <motion.div
            whileHover={{ y: -6 }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative h-[420px] rounded-3xl overflow-hidden bg-white shadow-sm hover:shadow-xl"
          >
            {/* Soft Gold Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#fffdf2] via-white to-[#fff6d6]" />

            {/* Pattern */}
            <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,#d4af37_1px,transparent_1px)] [background-size:30px_30px]" />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-end p-8">
              <HiOutlineSparkles size={34} color={gold} className="mb-4" />

              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                {t("cardTemplates.eidTemplates.title")}
              </h3>

              <p className="text-sm text-gray-600 mb-6 max-w-sm">
                {t("cardTemplates.eidTemplates.description")}
              </p>

              <button
                className="self-start px-7 py-3 rounded-xl font-medium transition border"
                style={{
                  borderColor: gold,
                  color: gold,
                }}
                onClick={() => handleRedirect()}
              >
                {t("cardTemplates.eidTemplates.buttonText")}
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default CardTemplatesSection;
