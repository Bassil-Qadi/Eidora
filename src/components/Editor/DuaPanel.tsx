interface Props {
    duas: string[];
    onSelect: (text: string) => void;
  }
  
  export default function DuaPanel({ duas, onSelect }: Props) {
    return (
      <div className="space-y-3">
        <h3 className="font-medium">Ramadan Duʿāʾ</h3>
  
        <div className="space-y-2">
          {duas.map((dua, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(dua)}
              className="
                w-full
                text-right
                text-sm
                bg-gray-50
                hover:bg-gray-100
                border
                rounded-lg
                px-3
                py-2
                transition
                font-cairo
              "
            >
              {dua}
            </button>
          ))}
        </div>
      </div>
    );
  }
  