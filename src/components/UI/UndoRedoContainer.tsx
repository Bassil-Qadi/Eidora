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
    <div className="flex items-center justify-center gap-4 mb-10">
      <Button
        icon={<FaUndo />}
        onClick={undo}
        disabled={!canUndo}
        className={`
          p-2 rounded-lg transition
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
          p-2 rounded-lg transition
          ${canRedo
            ? "bg-white text-zinc-800 hover:bg-zinc-100"
            : "bg-zinc-100 text-zinc-400 cursor-not-allowed"}
        `}
      />
    </div>
  );
}
