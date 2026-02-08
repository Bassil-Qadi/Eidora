import { useState } from "react";
import { EMOJIS } from "../../data/emojis";
import { FaSmile } from "react-icons/fa";
import SidebarButton from "../UI/SidebarButton";

interface Props {
  onSelect: (emoji: string) => void;
}

export default function EmojiBar({ onSelect }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-center mt-4 relative">
      
      {/* Toggle Button */}
      <SidebarButton
        onClick={() => setOpen((prev) => !prev)}
        icon={<FaSmile />}
        label="Emoji"
      />
      

      {/* Emoji Panel */}
      {open && (
        <div
          className="
            mt-3
            p-3
            bg-white
            rounded-2xl
            shadow-lg
            flex
            flex-wrap
            justify-center
            gap-3
            max-w-md
          "
        >
          {EMOJIS.map((emoji, index) => (
            <button
              key={index}
              onClick={() => {
                onSelect(emoji);
                setOpen(false);
              }}
              className="
                text-2xl
                hover:scale-125
                transition-transform
              "
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
