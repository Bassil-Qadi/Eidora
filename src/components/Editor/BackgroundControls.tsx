import { useLanguage } from "../../hooks/useLanguage";

interface Props {
  value: string;
  onChange: (color: string) => void;
}

const colors = ["#ffffff", "#fef3c7", "#ecfdf5", "#ede9fe", "#0f172a"];
const gradients = [
  "linear-gradient(90deg, #fde68a, #f87171)",
  "linear-gradient(90deg, #34d399, #3b82f6)",
  "linear-gradient(90deg, #f472b6, #a78bfa)",
  "linear-gradient(90deg, #0f172a, #1e293b)",
];

export default function BackgroundControls({ value, onChange }: Props) {

  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <label className="text-xs sm:text-sm font-medium">{t('editor.controlsSidebar.controls.background')}</label>

      {/* Solid color picker */}
      <input
        type="color"
        value={value.startsWith("linear-gradient") ? "#ffffff" : value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-8 sm:h-10"
      />

      {/* Preset solid colors */}
      <div className="flex gap-2">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded border"
            style={{ background: c }}
          />
        ))}
      </div>

      {/* Preset gradients */}
      <label className="text-xs sm:text-sm font-medium mt-2">{t('editor.controlsSidebar.controls.gradients')}</label>
      <div className="flex gap-2 flex-wrap">
        {gradients.map((g, idx) => (
          <button
            key={idx}
            onClick={() => onChange(g)}
            className="w-14 h-7 sm:w-16 sm:h-8 rounded border"
            style={{ background: g }}
          />
        ))}
      </div>
    </div>
  );
}
