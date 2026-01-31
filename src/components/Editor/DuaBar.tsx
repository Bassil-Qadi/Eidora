import { useState } from "react";
import { useLanguage } from "../../hooks/useLanguage";
import { DuaItem, DuaCategory } from "../../types/dua";

interface Props {
  duas: DuaItem[];
  onSelect: (text: string) => void;
}

export default function DuaBar({ duas, onSelect }: Props) {
  const { t } = useLanguage();
  const [active, setActive] = useState<DuaCategory>("ramadan");

  const filtered = duas.filter((d) => d.category === active);

  return (
    <div className="w-full">
      {/* Header + Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2 sm:gap-0">
        <h4 className="text-xs sm:text-sm font-medium text-gray-600">
          {t('editor.controlsSidebar.DuaaTitle')}
        </h4>

        <div className="flex rounded-lg border bg-gray-50 p-1">
          {(["ramadan", "eid"] as DuaCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`
                px-2 sm:px-3
                py-1
                text-xs
                rounded-md
                transition
                ${
                  active === cat
                    ? "bg-white shadow text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }
              `}
            >
              {cat === "ramadan" ? t('editor.controlsSidebar.stickerControls.filter.firstOption') : t('editor.controlsSidebar.stickerControls.filter.secondOption')}
            </button>
          ))}
        </div>
      </div>

      {/* Duas */}
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 pt-2 scrollbar-hide -mx-2 sm:mx-0 px-2 sm:px-0">
        {filtered.map((dua, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(dua.text)}
            style={{ fontFamily: 'Tajawal' }}
            className="
              shrink-0
              max-w-[200px] sm:max-w-[280px]
              px-3 sm:px-4
              py-2 sm:py-3
              rounded-xl
              bg-white
              border
              border-gray-200
              text-gray-800
              text-xs sm:text-sm
              leading-relaxed
              text-center
              hover:border-yellow-400
              hover:bg-yellow-50
              hover:-translate-y-[1px]
              transition-all
              whitespace-normal
            "
          >
            {dua.text}
          </button>
        ))}
      </div>
    </div>
  );
}
