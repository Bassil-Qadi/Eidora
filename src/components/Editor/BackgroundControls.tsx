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
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Background</label>

      {/* Solid color picker */}
      <input
        type="color"
        value={value.startsWith("linear-gradient") ? "#ffffff" : value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10"
      />

      {/* Preset solid colors */}
      <div className="flex gap-2">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className="w-8 h-8 rounded border"
            style={{ background: c }}
          />
        ))}
      </div>

      {/* Preset gradients */}
      <label className="text-sm font-medium mt-2">Gradients</label>
      <div className="flex gap-2">
        {gradients.map((g, idx) => (
          <button
            key={idx}
            onClick={() => onChange(g)}
            className="w-16 h-8 rounded border"
            style={{ background: g }}
          />
        ))}
      </div>
    </div>
  );
}
