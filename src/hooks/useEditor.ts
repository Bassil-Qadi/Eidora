import { useState } from "react";
import {
  EditorState,
  EditorTool,
  ImageElement,
  TextElement,
  CardTemplate,
} from "../types/editor";
import { generateId } from "../utils/generateId";
import { clamp } from "../utils/clamp";

/* ---------------------------------- */
/* Initial editor state */
/* ---------------------------------- */
const initialState: EditorState = {
  elements: [],
  selectedElementIds: [],
  activeTool: null,
  background: "#ffffff",
  previewImage: undefined,
};

/* ---------------------------------- */
/* History wrapper */
/* ---------------------------------- */
interface HistoryState {
  past: EditorState[];
  present: EditorState;
  future: EditorState[];
}

export const useEditor = () => {
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: initialState,
    future: [],
  });

  const state = history.present;
  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;


  /* ---------------------------------- */
  /* Helper: commit state to history */
  /* ---------------------------------- */
  const commitState = (updater: (prev: EditorState) => EditorState) => {
    setHistory((h) => {
      const next = updater(h.present);

      return {
        past: [...h.past, h.present],
        present: next,
        future: [],
      };
    });
  };

  /* ---------------------------------- */
  /* Undo / Redo */
  /* ---------------------------------- */
  const undo = () => {
    setHistory((h) => {
      if (h.past.length === 0) return h;

      const previous = h.past[h.past.length - 1];
      const newPast = h.past.slice(0, -1);

      return {
        past: newPast,
        present: previous,
        future: [h.present, ...h.future],
      };
    });
  };

  const redo = () => {
    setHistory((h) => {
      if (h.future.length === 0) return h;

      const next = h.future[0];
      const newFuture = h.future.slice(1);

      return {
        past: [...h.past, h.present],
        present: next,
        future: newFuture,
      };
    });
  };

  /* ---------------------------------- */
  /* Selection */
  /* ---------------------------------- */
  const setActiveTool = (tool: EditorTool) => {
    commitState((prev) => ({
      ...prev,
      activeTool: tool,
    }));
  };

  const selectElement = (id: string, additive = false) => {
    commitState((prev) => {
      if (!id) {
        return { ...prev, selectedElementIds: [] };
      }

      if (additive) {
        return {
          ...prev,
          selectedElementIds: prev.selectedElementIds.includes(id)
            ? prev.selectedElementIds.filter((x) => x !== id)
            : [...prev.selectedElementIds, id],
        };
      }

      return {
        ...prev,
        selectedElementIds: [id],
      };
    });
  };

  const clearSelection = () => {
    commitState((prev) => ({
      ...prev,
      selectedElementIds: [],
    }));
  };

  /* ---------------------------------- */
  /* Add elements */
  /* ---------------------------------- */
  const addText = () => {
    const newText: TextElement = {
      id: crypto.randomUUID(),
      type: "text",
      text: "Ramadan Mubarak",
      x: 50,
      y: 50,
      fontSize: 24,
      color: "#000000",
      fontFamily: "Arial",
      bold: false,
      italic: false,
      underline: false,
      width: 220,
    };

    commitState((prev) => ({
      ...prev,
      elements: [...prev.elements, newText],
      selectedElementIds: [newText.id],
    }));
  };

  const addDuaText = (text: string) => {
    const newText: TextElement = {
      id: crypto.randomUUID(),
      type: "text",
      text,
      x: 50,
      y: 50,
      fontSize: 22,
      color: "#000000",
      fontFamily: "Cairo",
      align: "center",
      bold: false,
      italic: false,
      underline: false,
      width: 260,
    };

    commitState((prev) => ({
      ...prev,
      elements: [...prev.elements, newText],
      selectedElementIds: [newText.id],
    }));
  };

  const addSticker = (src: string) => {
    const newSticker: ImageElement = {
      id: generateId(),
      type: "sticker",
      src,
      x: 50,
      y: 50,
      width: 80,
      height: 80,
      rotation: 0,
    };

    commitState((prev) => ({
      ...prev,
      elements: [...prev.elements, newSticker],
    }));
  };

  const addImage = (fileUrl: string) => {
    const newImage: ImageElement = {
      id: generateId(),
      type: "image",
      src: fileUrl,
      x: 50,
      y: 50,
      width: 120,
      height: 120,
    };

    commitState((prev) => ({
      ...prev,
      elements: [...prev.elements, newImage],
    }));
  };

  /* ---------------------------------- */
  /* Update elements */
  /* ---------------------------------- */
  const updateTextElement = (id: string, updates: Partial<TextElement>) => {
    commitState((prev) => ({
      ...prev,
      elements: prev.elements.map((el) =>
        el.id === id && el.type === "text" ? { ...el, ...updates } : el
      ),
    }));
  };

  const moveElement = (id: string, x: number, y: number) => {
    commitState((prev) => ({
      ...prev,
      elements: prev.elements.map((el) => {
        if (el.id !== id) return el;

        if (el.type === "text") {
          const textEl = el as TextElement;
          const textWidthPx = textEl.width ?? 200;
          const textHeightPx =
            textEl.fontSize * 1.3 * (textEl.text.split("\n").length || 1);

          const wPercent = (textWidthPx / 360) * 100;
          const hPercent = (textHeightPx / 520) * 100;

          return {
            ...textEl,
            x: clamp(x, wPercent / 2, 100 - wPercent / 2),
            y: clamp(y, hPercent / 2, 100 - hPercent / 2),
          };
        }

        if (el.type === "sticker" || el.type === "image") {
          const imgEl = el as ImageElement;
          const wPercent = (imgEl.width / 360) * 100;
          const hPercent = (imgEl.height / 520) * 100;

          return {
            ...imgEl,
            x: clamp(x, wPercent / 2, 100 - wPercent / 2),
            y: clamp(y, hPercent / 2, 100 - hPercent / 2),
          };
        }

        return el;
      }),
    }));
  };

  const resizeElement = (id: string, width: number, height: number) => {
    commitState((prev) => ({
      ...prev,
      elements: prev.elements.map((el) =>
        el.id === id && "width" in el
          ? {
              ...el,
              width: clamp(width, 30, 300),
              height: clamp(height, 30, 300),
            }
          : el
      ),
    }));
  };

  const rotateElement = (id: string, angle: number) => {
    commitState((prev) => ({
      ...prev,
      elements: prev.elements.map((el) =>
        el.id === id && "rotation" in el
          ? { ...el, rotation: ((angle % 360) + 360) % 360 }
          : el
      ),
    }));
  };

  /* ---------------------------------- */
  /* Delete / arrange */
  /* ---------------------------------- */
  const deleteSelected = () => {
    commitState((prev) => ({
      ...prev,
      elements: prev.elements.filter(
        (el) => !prev.selectedElementIds.includes(el.id)
      ),
      selectedElementIds: [],
    }));
  };

  const bringForward = (id: string) => {
    commitState((prev) => {
      const idx = prev.elements.findIndex((e) => e.id === id);
      if (idx === -1 || idx === prev.elements.length - 1) return prev;

      const next = [...prev.elements];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return { ...prev, elements: next };
    });
  };

  const sendBackward = (id: string) => {
    commitState((prev) => {
      const idx = prev.elements.findIndex((e) => e.id === id);
      if (idx <= 0) return prev;

      const next = [...prev.elements];
      [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]];
      return { ...prev, elements: next };
    });
  };

  /* ---------------------------------- */
  /* Background & templates */
  /* ---------------------------------- */
  const setBackground = (color: string) => {
    commitState((prev) => ({
      ...prev,
      background: color,
      previewImage: undefined,
    }));
  };

  const applyTemplate = (template: CardTemplate) => {
    commitState(() => ({
      elements: template.elements.map((el) => ({
        ...el,
        id: crypto.randomUUID(),
      })),
      selectedElementIds: [],
      activeTool: null,
      background: template.background,
      previewImage: template.preview || undefined,
    }));
  };

  /* ---------------------------------- */
  /* Public API */
  /* ---------------------------------- */
  return {
    state,
    canUndo, 
    canRedo,
    undo,
    redo,
    setActiveTool,
    selectElement,
    clearSelection,
    addText,
    addDuaText,
    updateTextElement,
    moveElement,
    addSticker,
    addImage,
    resizeElement,
    rotateElement,
    deleteSelected,
    setBackground,
    alignCenterX: (id: string) =>
      commitState((prev) => ({
        ...prev,
        elements: prev.elements.map((el) =>
          el.id === id ? { ...el, x: 50 } : el
        ),
      })),
    alignCenterY: (id: string) =>
      commitState((prev) => ({
        ...prev,
        elements: prev.elements.map((el) =>
          el.id === id ? { ...el, y: 50 } : el
        ),
      })),
    bringForward,
    sendBackward,
    applyTemplate,
  };
};
