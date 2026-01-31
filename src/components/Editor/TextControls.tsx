import { useLanguage } from "../../hooks/useLanguage";
import { TextElement } from "../../types/editor";
import { GOOGLE_FONTS } from "../../constants/fonts";
import { measureTextWidth } from "../../utils/measureTextWidth";

import {
  MdAlignHorizontalLeft,
  MdAlignHorizontalRight,
  MdVerticalAlignTop,
  MdVerticalAlignBottom,
  MdAlignHorizontalCenter,
  MdAlignVerticalCenter,
} from "react-icons/md";

interface Props {
  text: TextElement;
  onChange: (updates: Partial<TextElement>) => void;
}

export default function TextControls({ text, onChange }: Props) {

  const { t } = useLanguage();
  const alignHorizontal = (pos: "left" | "center" | "right") => {
    const canvasWidth = 360; // SAME as your canvas width
    const paddingPx = 12;
  
    const textWidthPx = measureTextWidth(
      text.text,
      text.fontSize
    );
  
    const textWidthPercent = (textWidthPx / canvasWidth) * 100;
    const paddingPercent = (paddingPx / canvasWidth) * 100;
  
    if (pos === "center") {
      onChange({ x: 50 });
    }
  
    if (pos === "left") {
      onChange({
        x: paddingPercent + textWidthPercent / 2,
      });
    }
  
    if (pos === "right") {
      onChange({
        x: 100 - paddingPercent - textWidthPercent / 2,
      });
    }
  };
  

  const alignVertical = (pos: "top" | "center" | "bottom") => {
    if (pos === "top") onChange({ y: 10 });
    if (pos === "center") onChange({ y: 50 });
    if (pos === "bottom") onChange({ y: 90 });
  };

  return (
    <div className="flex flex-col gap-2 space-y-3 sm:space-y-4">
      {/* Font family */}
      <div>
        <label className="text-xs sm:text-sm font-medium">{t('editor.controlsSidebar.textControls.fontFamily')}</label>
        <select
          value={text.fontFamily}
          onChange={(e) => onChange({ fontFamily: e.target.value })}
          className="w-full border rounded px-2 py-1.5 text-sm"
          style={{ fontFamily: text.fontFamily }}
        >
          {GOOGLE_FONTS.map((font) => (
            <option
              key={font}
              value={font}
              style={{ fontFamily: font }}
            >
              {font}
            </option>
          ))}
        </select>
      </div>

      {/* Font size */}
      <div>
        <label className="text-xs sm:text-sm font-medium">{t('editor.controlsSidebar.textControls.fontSize')}</label>
        <input
          type="range"
          min={12}
          max={72}
          value={text.fontSize}
          onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Color */}
      <div>
        <label className="text-xs sm:text-sm font-medium">{t('editor.controlsSidebar.textControls.fontColor')}</label>
        <input
          type="color"
          value={text.color}
          onChange={(e) => onChange({ color: e.target.value })}
          className="w-full h-8 sm:h-10"
        />
      </div>

      {/* Style toggles */}
      <div className="flex flex-col gap-2">
      <p className="text-xs sm:text-sm font-medium">{t('editor.controlsSidebar.textControls.fontStyle')}</p>
      <div className="flex gap-2">
        <button
          onClick={() => onChange({ bold: !text.bold })}
          className={`px-2 sm:px-3 py-1.5 border rounded text-sm ${text.bold ? "bg-gray-200" : ""}`}
        >
          B
        </button>

        <button
          onClick={() => onChange({ italic: !text.italic })}
          className={`px-2 sm:px-3 py-1.5 border rounded text-sm ${text.italic ? "bg-gray-200" : ""}`}
        >
          I
        </button>

        <button
          onClick={() => onChange({ underline: !text.underline })}
          className={`px-2 sm:px-3 py-1.5 border rounded text-sm ${text.underline ? "bg-gray-200" : ""}`}
        >
          U
        </button>
      </div>
      </div>

      <div className="flex flex-col gap-2">
      <p className="text-xs sm:text-sm font-medium">{t('editor.controlsSidebar.textControls.textAlignment')}</p>
        <div className="grid grid-cols-3 gap-2">
        <button className="
                    h-8 sm:h-10
                    flex
                    items-center
                    justify-center
                    bg-gray-100
                    rounded
                    hover:bg-gray-200
                    text-sm sm:text-base
                  " onClick={() => alignVertical("top")}>
          <MdVerticalAlignTop />
        </button>
        <button className="
                    h-8 sm:h-10
                    flex
                    items-center
                    justify-center
                    bg-gray-100
                    rounded
                    hover:bg-gray-200
                    text-sm sm:text-base
                  " onClick={() => alignVertical("center")}>
          <MdAlignVerticalCenter />
        </button>
        <button className="
                    h-8 sm:h-10
                    flex
                    items-center
                    justify-center
                    bg-gray-100
                    rounded
                    hover:bg-gray-200
                    text-sm sm:text-base
                  " onClick={() => alignVertical("bottom")}>
          <MdVerticalAlignBottom />
        </button>
        <button className="
                    h-8 sm:h-10
                    flex
                    items-center
                    justify-center
                    bg-gray-100
                    rounded
                    hover:bg-gray-200
                    text-sm sm:text-base
                  " onClick={() => alignHorizontal("left")}>
          <MdAlignHorizontalLeft />
        </button>
        <button className="
                    h-8 sm:h-10
                    flex
                    items-center
                    justify-center
                    bg-gray-100
                    rounded
                    hover:bg-gray-200
                    text-sm sm:text-base
                  " onClick={() => alignHorizontal("center")}>
          <MdAlignHorizontalCenter />
        </button>
        <button className="
                    h-8 sm:h-10
                    flex
                    items-center
                    justify-center
                    bg-gray-100
                    rounded
                    hover:bg-gray-200
                    text-sm sm:text-base
                  " onClick={() => alignHorizontal("right")}>
          <MdAlignHorizontalRight />
        </button>
        </div>
      </div>
    </div>
  );
}
