export type EditorTool = "text" | "sticker" | "image" | "background" | null;

export type EditorElementType = "text" | "image" | "sticker";

export type TemplateElement = TextElement | ImageElement;

export interface EditorElement {
  id: string;
  type: EditorElementType;
  x: number;
  y: number;
}

export interface TextElement extends EditorElement {
  type: "text";
  text: string;
  fontSize: number;
  color: string;
  fontFamily?: string; 
  width?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: "left" | "center" | "right";
}

export interface ImageElement extends EditorElement {
  type: "image" | "sticker";
  src: string;
  width: number;
  height: number;
  rotation?: number;
}

export interface EditorState {
  elements: EditorElement[];
  selectedElementIds: string[];
  activeTool: EditorTool;
  background: string;        // The actual background (color/gradient)
  previewImage?: string;     // Optional template image (only applied when template first loaded)
}

export interface CardTemplate {
  id: string;
  name: string;
  preview: string; 
  background: string;
  elements: TemplateElement[];
}