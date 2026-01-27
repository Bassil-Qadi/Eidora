import { useState } from "react";
import { StickerCategory } from "../../types/stickers";

interface Props {
    stickers: { id: string; src: string, category: string }[];
    onSelect: (src: string) => void;
}

export default function StickerPicker({ stickers, onSelect }: Props) {

    const [active, setActive] = useState<StickerCategory>('ramadan');
    const filtered = stickers.filter((s) => s.category === active);

    return (
        <div className="mt-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium mb-2">Stickers</h3>
                <div className="flex rounded-lg border bg-gray-50 p-1">
                    {(["ramadan", "eid"] as StickerCategory[]).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActive(cat)}
                            className={`
                                px-3
                                py-1
                                text-xs
                                rounded-md
                                transition
                                ${active === cat
                                    ? "bg-white shadow text-gray-900"
                                    : "text-gray-500 hover:text-gray-700"
                                }
                            `}
                        >
                            {cat === "ramadan" ? "Ramadan" : "Eid"}
                        </button>
                    ))}
                </div>
            </div>
            <div
                className={`
                    flex flex-col gap-3
                    max-h-[400px]
                    overflow-y-auto
                    pr-1
                `}
            >
                {filtered.map((sticker) => (
                    <button
                        key={sticker.id}
                        onClick={() => onSelect(sticker.src)}
                        className="
                            p-2
                            rounded-xl
                            bg-white
                            hover:bg-gray-100
                            shadow-sm
                            transition
                        "
                    >
                        <img
                            src={sticker.src}
                            alt=""
                            className={`mx-auto object-contain w-24 h-24'
                                }`}
                        />
                    </button>
                ))}
            </div>

        </div>

    );
}
