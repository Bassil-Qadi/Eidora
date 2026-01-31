import React from 'react'
import Button from './Button'
import { FaUndo } from "react-icons/fa"; 
import { FaRedo } from "react-icons/fa"; 

interface UndoRedoProps {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export default function UndoRedoContainer({ undo, redo, canUndo, canRedo }: UndoRedoProps) {
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-10">
      <Button
        icon={<FaUndo />}
        onClick={undo}
        disabled={!canUndo}
        className={`
          p-1.5 sm:p-2 rounded-lg transition text-sm sm:text-base
          ${canUndo
            ? "bg-white text-zinc-800 hover:bg-zinc-100"
            : "bg-zinc-100 text-zinc-400 cursor-not-allowed"}
        `}
      />

      <Button
        icon={<FaRedo />}
        onClick={redo}
        disabled={!canRedo}
        className={`
          p-1.5 sm:p-2 rounded-lg transition text-sm sm:text-base
          ${canRedo
            ? "bg-white text-zinc-800 hover:bg-zinc-100"
            : "bg-zinc-100 text-zinc-400 cursor-not-allowed"}
        `}
      />
    </div>
  );
}
