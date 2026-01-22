import { CardTemplate } from "../../types/editor";

interface Props {
  templates: CardTemplate[];
  onSelect: (template: CardTemplate) => void;
}

export default function TemplatesPanel({ templates, onSelect }: Props) {
  return (
    <div className="mt-4">
      <h3 className="font-medium mb-2">Templates</h3>

      <div className="flex flex-col gap-6 max-h-[400px] overflow-y-auto p-2">
        {templates.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => onSelect(tpl)}
            className="flex flex-col items-center w-full rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:ring-2 hover:ring-blue-500 transition-all duration-150"
          >
            <img
              src={tpl.preview}
              alt={tpl.name}
              className="w-full h-36 object-cover"
            />
           <div className="w-full px-3 py-2 text-sm font-medium text-gray-800 
                bg-white/80 backdrop-blur border-t">
  {tpl.name}
</div>
          </button>
        ))}
      </div>
    </div>
  );
}
