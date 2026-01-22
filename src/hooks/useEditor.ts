import { useState } from "react";
import { EditorState, EditorTool, ImageElement, TextElement, CardTemplate } from "../types/editor";
import { generateId } from "../utils/generateId";
import { clamp } from "../utils/clamp";

interface HistoryState {
  past: EditorState[];
  present: EditorState;
  future: EditorState[];
}

const initialState: EditorState = {
  elements: [],
  selectedElementIds: [],
  activeTool: null,
  background: "#ffffff",
  previewImage: undefined,
};

export const useEditor = () => {
  const [state, setState] = useState<EditorState>(initialState);

  const setActiveTool = (tool: EditorTool) => {
    setState((prev) => ({
      ...prev,
      activeTool: tool,
    }));
  };

  const selectElement = (id: string, additive = false) => {
    setState((prev) => {

      if (!id) {
        return {
          ...prev,
          selectedElementIds: [],
        };
      }

      if (additive) {
        return {
          ...prev,
          selectedElementIds: prev.selectedElementIds.includes(id)
            ? prev.selectedElementIds.filter((x) => x !== id) // toggle off
            : [...prev.selectedElementIds, id], // add
        };
      }
  
      return {
        ...prev,
        selectedElementIds: [id], // single select
      };
    });
  };
  
  const clearSelection = () => {
    setState((prev) => ({
      ...prev,
      selectedElementIds: [],
    }));
  };
  

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

    setState((prev) => ({
      ...prev,
      elements: [...prev.elements, newText],
      selectedElementId: newText.id,
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
      color: "#000000", // soft gold
      fontFamily: "Cairo",
      align: "center",
      bold: false,
      italic: false,
      underline: false,
    };
  
    setState((prev) => ({
      ...prev,
      elements: [...prev.elements, newText],
      selectedElementIds: [newText.id],
    }));
  };
  

  const updateTextElement = (
    id: string,
    updates: Partial<TextElement>
  ) => {
    setState((prev) => ({
      ...prev,
      elements: prev.elements.map((el) =>
        el.id === id && el.type === "text"
          ? { ...el, ...updates }
          : el
      ),
    }));
  };

  const moveElement = (id: string, x: number, y: number) => {
    setState((prev) => ({
      ...prev,
      elements: prev.elements.map((el) => {
        if (el.id !== id) return el;
  
        // -------- TEXT --------
        if (el.type === "text") {
          const textEl = el as TextElement;
        
          const textWidthPx = textEl.width ?? 200;
          const textHeightPx = textEl.fontSize * 1.3 * (textEl.text.split("\n").length || 1);
        
          const wPercent = (textWidthPx / 360) * 100;
          const hPercent = (textHeightPx / 520) * 100;
        
          return {
            ...textEl,
            x: clamp(x, wPercent / 2, 100 - wPercent / 2),
            y: clamp(y, hPercent / 2, 100 - hPercent / 2),
          };
        }
  
        // -------- STICKER / IMAGE --------
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
  
  const addSticker = (src: string) => {
    const newSticker: ImageElement = {
      id: generateId(),
      type: "sticker",
      src,
      x: 50,
      y: 50,
      width: 80,
      height: 80,
      rotation: 0
    };
    setState(prev => ({ ...prev, elements: [...prev.elements, newSticker] }));
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
    setState(prev => ({ ...prev, elements: [...prev.elements, newImage] }));
  };

  const resizeElement = (id: string, width: number, height: number) => {
    setState((prev) => ({
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
    setState((prev) => ({
      ...prev,
      elements: prev.elements.map((el) =>
        el.id === id && "rotation" in el
          ? {
              ...el,
              rotation: ((angle % 360) + 360) % 360,
            }
          : el
      ),
    }));
  };

  const deleteSelected = () => {
    setState((prev) => {
      if (prev.selectedElementIds.length === 0) return prev;
  
      return {
        ...prev,
        elements: prev.elements.filter(
          (el) => !prev.selectedElementIds.includes(el.id)
        ),
        selectedElementIds: [],
      };
    });
  };
  
  const setBackground = (color: string) => {
    setState(prev => ({
      ...prev,
      background: color,
      previewImage: undefined,  // Remove template image when user chooses custom background
    }));
  };
  

  const alignCenterX = (id: string) => {
    setState(prev => ({
      ...prev,
      elements: prev.elements.map(el =>
        el.id === id ? { ...el, x: 50 } : el
      )
    }));
  };
  
  const alignCenterY = (id: string) => {
    setState(prev => ({
      ...prev,
      elements: prev.elements.map(el =>
        el.id === id ? { ...el, y: 50 } : el
      )
    }));
  };

  const bringForward = (id: string) => {
    setState((prev) => {
      const idx = prev.elements.findIndex((e) => e.id === id);
      if (idx === -1 || idx === prev.elements.length - 1) return prev;
  
      const next = [...prev.elements];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
  
      return { ...prev, elements: next };
    });
  };
  
  const sendBackward = (id: string) => {
    setState((prev) => {
      const idx = prev.elements.findIndex((e) => e.id === id);
      if (idx <= 0) return prev;
  
      const next = [...prev.elements];
      [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]];
  
      return { ...prev, elements: next };
    });
  };
  
  const applyTemplate = (template: CardTemplate) => {
    setState(prev => ({
      elements: template.elements.map(el => ({
        ...el,
        id: crypto.randomUUID(),
      })),
      selectedElementIds: [],
      activeTool: null,
      background: template.background,      // Initial color/gradient
      previewImage: template.preview || undefined, // Only for initial template display
    }));
  };  

  return {
    state,
    setActiveTool,
    selectElement,
    addText,
    updateTextElement,
    moveElement,
    addSticker,
    addImage,
    resizeElement,
    rotateElement,
    deleteSelected,
    setBackground,
    alignCenterX,
    alignCenterY,
    bringForward,
    sendBackward,
    clearSelection,
    applyTemplate,
    addDuaText
  };
};