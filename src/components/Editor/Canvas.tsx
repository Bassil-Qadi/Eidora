import { useRef, useState, useEffect, forwardRef } from "react";
import { EditorElement, TextElement, ImageElement } from "../../types/editor";
import { measureTextWidth } from "../../utils/measureTextWidth";

interface CanvasProps {
  elements: EditorElement[];
  selectedElementId: string | null;
  selectedElementIds: string[],
  onSelect: (id: string, additive?: boolean) => void;
  onClearSelection: () => void;
  onMove: (id: string, x: number, y: number) => void;
  onUpdate: (id: string, updates: Partial<TextElement>) => void;
  onResize: (id: string, width: number, height: number) => void;
  onRotate: (id: string, rotation: number) => void;
  onDelete: (id: string) => void;
  duplicateSelected: () => void;
  background: string;
  previewImage?: string;
}

const SNAP_THRESHOLD = 1.5;

const Canvas = forwardRef<HTMLDivElement, CanvasProps>(
  (
    {
      elements,
      selectedElementId,
      selectedElementIds,
      onSelect,
      onClearSelection,
      onMove,
      onUpdate,
      onResize,
      onRotate,
      onDelete,
      duplicateSelected,
      background,
      previewImage
    },
    ref
  ) => {
    // Refs
    const canvasRef = useRef<HTMLDivElement>(null);
    const dragStart = useRef<{
      mouseX: number;
      mouseY: number;
      elements: Record<string, { x: number; y: number }>;
    } | null>(null);
    const rotateStart = useRef<{ startAngle: number; centerX: number; centerY: number } | null>(null);
    const resizeStart = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
    const textResizeStart = useRef<{
      startX: number;
      startWidth: number;
    } | null>(null);

    // State
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingValue, setEditingValue] = useState<string>("");
    const [resizingId, setResizingId] = useState<string | null>(null);
    const [rotatingId, setRotatingId] = useState<string | null>(null);
    const [resizingTextId, setResizingTextId] = useState<string | null>(null);

    // Dragging
    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        // ROTATION LOGIC
        if (rotatingId && rotateStart.current) {
          if (!rotatingId || !rotateStart.current) return;

          const { centerX, centerY, startAngle } = rotateStart.current;

          const currentAngle = Math.atan2(
            e.clientY - centerY,
            e.clientX - centerX
          );

          const delta = currentAngle - startAngle;
          const rotation = (delta * 180) / Math.PI;

          onRotate(rotatingId, rotation);
        }

        // RESIZE LOGIC (already exists)
        if (resizingId && resizeStart.current) {
          const dx = e.clientX - resizeStart.current.x;
          const dy = e.clientY - resizeStart.current.y;
          const scale = Math.max(
            (resizeStart.current.w + dx) / resizeStart.current.w,
            (resizeStart.current.h + dy) / resizeStart.current.h
          );

          onResize(
            resizingId,
            Math.max(20, resizeStart.current.w * scale),
            Math.max(20, resizeStart.current.h * scale)
          );
          return;
        }

        if (resizingTextId && textResizeStart.current) {
          const dx = e.clientX - textResizeStart.current.startX;
          const newWidth = Math.max(80, textResizeStart.current.startWidth + dx);

          onUpdate(resizingTextId, { width: newWidth });
          return;
        }

        if (resizingTextId && textResizeStart.current) {
          const dx = e.clientX - textResizeStart.current.startX;
          const newWidth = Math.max(80, textResizeStart.current.startWidth + dx);

          onUpdate(resizingTextId, { width: newWidth });
          return;
        }

        // DRAG LOGIC (already exists)
        if (
          !draggingId ||
          !canvasRef.current ||
          !dragStart.current ||
          (editingId && !resizingTextId)
        )
          return;

        const rect = canvasRef.current.getBoundingClientRect();

        const dx =
          ((e.clientX - dragStart.current.mouseX) / rect.width) * 100;
        const dy =
          ((e.clientY - dragStart.current.mouseY) / rect.height) * 100;

        Object.entries(dragStart.current.elements).forEach(
          ([id, startPos]) => {
            let x = startPos.x + dx;
            let y = startPos.y + dy;

            // SNAP TO CENTER
            if (Math.abs(x - 50) < SNAP_THRESHOLD) x = 50;
            if (Math.abs(y - 50) < SNAP_THRESHOLD) y = 50;

            onMove(id, x, y);
          }
        );

      };

      const handleMouseUp = () => {
        setDraggingId(null);
        setResizingId(null);
        setRotatingId(null);
        setResizingTextId(null);

        dragStart.current = null;
        rotateStart.current = null;
        textResizeStart.current = null;

      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }, [draggingId, editingId, resizingId, onMove, onResize]);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (
          (e.key === "Delete" || e.key === "Backspace") &&
          selectedElementId &&
          !editingId
        ) {
          e.preventDefault();
          onDelete(selectedElementId);
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedElementId, editingId]);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Delete
        if (
          (e.key === "Delete" || e.key === "Backspace") &&
          selectedElementIds.length > 0 &&
          !editingId
        ) {
          e.preventDefault();
          selectedElementIds.forEach(id => onDelete(id));
        }
    
        // Duplicate (Ctrl+D / Cmd+D)
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
          e.preventDefault();
          // call duplicate
          duplicateSelected();
        }
      };
    
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedElementIds, editingId]);
    

    return (
      <div className="flex items-center justify-center">
        <div
          ref={(node) => {
            canvasRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }}
          className={`relative ${!previewImage ? 'shadow-xl' : ''} w-[360px] h-[580px]`}
          style={{
            background: previewImage
              ? `url(${previewImage}) center/contain no-repeat`
              : background
          }}
          onClick={() => onClearSelection()}
        >
          {elements.map((el) => {
            // ---------- TEXT ----------
            if (el.type === "text") {
              const text = el as TextElement;
              const isSelected = selectedElementIds.includes(el.id);

              return (
                <div
                  key={text.id}
                  onClick={(e) => {
                    e.stopPropagation();

                    const additive = e.metaKey || e.ctrlKey;
                    onSelect(el.id, additive);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingId(text.id);
                    setEditingValue(text.text);
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    if (editingId) return;

                    dragStart.current = {
                      mouseX: e.clientX,
                      mouseY: e.clientY,
                      elements: Object.fromEntries(
                        selectedElementIds.includes(text.id)
                          ? elements
                            .filter((el) => selectedElementIds.includes(el.id))
                            .map((el) => [el.id, { x: el.x, y: el.y }])
                          : [[text.id, { x: text.x, y: text.y }]]
                      ),
                    };

                    setDraggingId(text.id);
                  }}
                  className={`absolute cursor-pointer select-none ${isSelected ? "outline outline-2 outline-blue-500" : ""
                    }`}
                  style={{
                    left: `${text.x}%`,
                    top: `${text.y}%`,
                    transform: "translate(-50%, -50%)",
                    maxWidth: "90%",
                  }}
                >
                  {editingId === text.id ? (
                    <textarea
                      value={editingValue}
                      autoFocus
                      onChange={(e) => setEditingValue(e.target.value)}
                      onBlur={() => {
                        const measuredWidth = measureTextWidth(
                          editingValue,
                          text.fontSize,
                          text.fontFamily
                        );

                        onUpdate(text.id, {
                          text: editingValue,
                          width: Math.max(80, Math.min(text.width ?? 200, measuredWidth + 12)),
                        });
                        setEditingId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          setEditingId(null);
                        }
                      }}
                      className="resize-none overflow-hidden"
                      style={{
                        width: text.width ?? 200,
                        fontSize: text.fontSize,
                        color: text.color,
                        fontFamily: text.fontFamily,
                        fontWeight: text.bold ? "bold" : "normal",
                        fontStyle: text.italic ? "italic" : "normal",
                        textDecoration: text.underline ? "underline" : "none",
                        lineHeight: 1.3,
                        whiteSpace: "pre-wrap",
                        background: "transparent",
                        border: "1px dashed #999",
                        outline: "none",
                      }}
                    />

                  ) : (
                    <div
                      style={{
                        fontSize: text.fontSize,
                        color: text.color,
                        fontFamily: text.fontFamily,
                        fontWeight: text.bold ? "bold" : "normal",
                        fontStyle: text.italic ? "italic" : "normal",
                        textDecoration: text.underline ? "underline" : "none",
                        width: text.width ?? 200,
                        whiteSpace: "pre-wrap",       // 👈 multiline
                        wordBreak: "break-word",      // 👈 prevent overflow
                        textAlign: text.align ?? "center",
                        lineHeight: 1.3,
                      }}
                    >
                      {text.text}
                    </div>
                  )}

                  {isSelected && (
                    <div
                      onMouseDown={(e) => {
                        e.stopPropagation();

                        onSelect(text.id); // 👈 IMPORTANT

                        textResizeStart.current = {
                          startX: e.clientX,
                          startWidth: text.width ?? 200,
                        };

                        setResizingTextId(text.id);
                      }}
                      className="
                        absolute
                        top-1/2
                        -right-2
                        w-3
                        h-6
                        bg-white
                        border
                        border-blue-500
                        cursor-ew-resize
                        rounded-sm
                      "
                      style={{ transform: "translateY(-50%)" }}
                    />
                  )}
                </div>
              );
            }

            // ---------- STICKER ----------
            if (el.type === "sticker") {
              const sticker = el as ImageElement;
              const isSelected = selectedElementIds.includes(el.id);

              return (
                <div
                  key={sticker.id}
                  onClick={(e) => {
                    e.stopPropagation();

                    const additive = e.metaKey || e.ctrlKey;
                    onSelect(el.id, additive);
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    if (editingId) return;

                    dragStart.current = {
                      mouseX: e.clientX,
                      mouseY: e.clientY,
                      elements: Object.fromEntries(
                        selectedElementIds.includes(el.id)
                          ? elements
                            .filter((el) => selectedElementIds.includes(el.id))
                            .map((el) => [el.id, { x: el.x, y: el.y }])
                          : [[el.id, { x: el.x, y: el.y }]]
                      ),
                    };

                    setDraggingId(el.id);
                  }}
                  className={`absolute cursor-pointer ${isSelected ? "outline outline-2 outline-blue-500" : ""
                    }`}
                  style={{
                    left: `${sticker.x}%`,
                    top: `${sticker.y}%`,
                    transform: `translate(-50%, -50%) rotate(${sticker.rotation ?? 0}deg)`,
                    width: sticker.width,
                    height: sticker.height,
                  }}
                >
                  <img
                    src={sticker.src}
                    draggable={false}
                    className="w-full h-full object-contain pointer-events-none"
                  />
                  {isSelected && (
                    <>
                      {/* RESIZE HANDLE (already exists) */}
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setResizingId(sticker.id);
                          resizeStart.current = {
                            x: e.clientX,
                            y: e.clientY,
                            w: sticker.width,
                            h: sticker.height,
                          };
                        }}
                        className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border border-blue-500 cursor-se-resize pointer-events-auto"
                      />

                      {/* ROTATE HANDLE */}
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();

                          const rect = canvasRef.current!.getBoundingClientRect();
                          const elRect = e.currentTarget.parentElement!.getBoundingClientRect();

                          const centerX = elRect.left + elRect.width / 2;
                          const centerY = elRect.top + elRect.height / 2;

                          rotateStart.current = {
                            startAngle: Math.atan2(e.clientY - centerY, e.clientX - centerX),
                            centerX,
                            centerY,
                          };

                          setRotatingId(sticker.id);
                          onSelect(sticker.id);
                        }}
                        className="absolute -top-4 left-1/2 w-4 h-4 bg-yellow-400 border border-blue-500 rounded-full cursor-pointer pointer-events-auto"
                        style={{ transform: "translateX(-50%)" }}
                      />
                    </>
                  )}
                </div>
              );
            }

            return null;
          })}

        </div>
      </div>
    );
  }
);

export default Canvas;
