import { CardTemplate } from "../../types/editor";
import { useLanguage } from "../../hooks/useLanguage";

interface Props {
  templates: CardTemplate[];
  onSelect: (template: CardTemplate) => void;
}

export default function TemplatesPanel({ templates, onSelect }: Props) {

  const { t } = useLanguage();

  return (
    <div className="mt-4">
      <h3 className="text-xs sm:text-sm font-medium mb-3">{t('editor.controlsSidebar.controls.templates')}</h3>

      <div className="flex flex-col gap-2.5 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-1">
        {templates.map((tpl) => {
          const textCount = tpl.elements.filter(el => el.type === "text").length;
          
          return (
            <button
              key={tpl.id}
              onClick={() => onSelect(tpl)}
              className="group relative flex items-center gap-3 w-full rounded-lg border border-gray-200/80 
                         bg-white hover:border-blue-400 hover:bg-blue-50/30 hover:shadow-md 
                         transition-all duration-200 active:scale-[0.99] p-3"
            >
              {/* Background Preview - Compact */}
              <div 
                className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg relative overflow-hidden shadow-sm"
              >
                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />

                <img src={tpl.preview} alt={tpl.name} className="w-full h-full object-contain" />
                
                {/* Decorative accent */}
                <div className="absolute bottom-1 right-1 w-2 h-2 bg-white/40 rounded-full" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-800 group-hover:text-blue-600 
                                transition-colors truncate">
                    {tpl.name}
                  </h4>
                  {textCount > 0 && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {textCount} {textCount === 1 ? 'element' : 'elements'}
                    </p>
                  )}
                </div>

                {/* Arrow indicator */}
                <div className="flex-shrink-0 text-gray-400 group-hover:text-blue-500 transition-colors">
                  <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 5l7 7-7 7" 
                    />
                  </svg>
                </div>
              </div>

              {/* Hover accent line */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 transform scale-y-0 
                            group-hover:scale-y-100 transition-transform duration-200 rounded-l-lg" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
