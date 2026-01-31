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

    // Helper to get coordinates from mouse or touch event
    const getEventCoords = (e: React.MouseEvent | React.TouchEvent) => {
      if ('touches' in e && e.touches.length > 0) {
        return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
      }
      const mouseEvent = e as React.MouseEvent;
      return { clientX: mouseEvent.clientX, clientY: mouseEvent.clientY };
    };

    // State
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingValue, setEditingValue] = useState<string>("");
    const [resizingId, setResizingId] = useState<string | null>(null);
    const [rotatingId, setRotatingId] = useState<string | null>(null);
    const [resizingTextId, setResizingTextId] = useState<string | null>(null);

    // Dragging - unified handler for mouse and touch
    useEffect(() => {
      const getClientCoords = (e: MouseEvent | TouchEvent) => {
        if ('touches' in e && e.touches.length > 0) {
          return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
        }
        return { clientX: (e as MouseEvent).clientX, clientY: (e as MouseEvent).clientY };
      };

      const handleMove = (e: MouseEvent | TouchEvent) => {
        // Prevent scrolling on touch devices when dragging/resizing
        if ('touches' in e && (draggingId || resizingId || rotatingId || resizingTextId)) {
          e.preventDefault();
        }

        const { clientX, clientY } = getClientCoords(e);

        // ROTATION LOGIC
        if (rotatingId && rotateStart.current) {
          if (!rotatingId || !rotateStart.current) return;

          const { centerX, centerY, startAngle } = rotateStart.current;

          const currentAngle = Math.atan2(
            clientY - centerY,
            clientX - centerX
          );

          const delta = currentAngle - startAngle;
          const rotation = (delta * 180) / Math.PI;

          onRotate(rotatingId, rotation);
        }

        // RESIZE LOGIC
        if (resizingId && resizeStart.current) {
          const dx = clientX - resizeStart.current.x;
          const dy = clientY - resizeStart.current.y;
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
          const dx = clientX - textResizeStart.current.startX;
          const newWidth = Math.max(80, textResizeStart.current.startWidth + dx);

          onUpdate(resizingTextId, { width: newWidth });
          return;
        }

        // DRAG LOGIC
        if (
          !draggingId ||
          !canvasRef.current ||
          !dragStart.current ||
          (editingId && !resizingTextId)
        )
          return;

        const rect = canvasRef.current.getBoundingClientRect();

        const dx =
          ((clientX - dragStart.current.mouseX) / rect.width) * 100;
        const dy =
          ((clientY - dragStart.current.mouseY) / rect.height) * 100;

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

      const handleEnd = () => {
        setDraggingId(null);
        setResizingId(null);
        setRotatingId(null);
        setResizingTextId(null);

        dragStart.current = null;
        rotateStart.current = null;
        textResizeStart.current = null;
        resizeStart.current = null;
      };

      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleMove, { passive: false });
      window.addEventListener("touchend", handleEnd);
      window.addEventListener("touchcancel", handleEnd);

      return () => {
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup", handleEnd);
        window.removeEventListener("touchmove", handleMove);
        window.removeEventListener("touchend", handleEnd);
        window.removeEventListener("touchcancel", handleEnd);
      };
    }, [draggingId, editingId, resizingId, rotatingId, resizingTextId, onMove, onResize, onRotate, onUpdate]);

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
      <div className="flex items-center justify-center w-full">
        <div
          ref={(node) => {
            canvasRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }}
          className={`relative ${!previewImage ? 'shadow-xl' : ''} w-[280px] h-[450px] sm:w-[320px] sm:h-[520px] md:w-[360px] md:h-[580px]`}
          style={{
            background: previewImage ? undefined : background
          }}
          onClick={() => onClearSelection()}
        >
          {previewImage && (
            <img
              src={previewImage}
              alt="Template background"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              style={{ zIndex: 0, objectPosition: 'center' }}
              crossOrigin="anonymous"
            />
          )}
          <div className="relative w-full h-full" style={{ zIndex: 1 }}>
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

                    const coords = getEventCoords(e);
                    dragStart.current = {
                      mouseX: coords.clientX,
                      mouseY: coords.clientY,
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
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    if (editingId) return;

                    const coords = getEventCoords(e);
                    dragStart.current = {
                      mouseX: coords.clientX,
                      mouseY: coords.clientY,
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

                        const coords = getEventCoords(e);
                        textResizeStart.current = {
                          startX: coords.clientX,
                          startWidth: text.width ?? 200,
                        };

                        setResizingTextId(text.id);
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        e.preventDefault();

                        onSelect(text.id);

                        const coords = getEventCoords(e);
                        textResizeStart.current = {
                          startX: coords.clientX,
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

                    const coords = getEventCoords(e);
                    dragStart.current = {
                      mouseX: coords.clientX,
                      mouseY: coords.clientY,
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
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    if (editingId) return;

                    const coords = getEventCoords(e);
                    dragStart.current = {
                      mouseX: coords.clientX,
                      mouseY: coords.clientY,
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
                          const coords = getEventCoords(e);
                          resizeStart.current = {
                            x: coords.clientX,
                            y: coords.clientY,
                            w: sticker.width,
                            h: sticker.height,
                          };
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setResizingId(sticker.id);
                          const coords = getEventCoords(e);
                          resizeStart.current = {
                            x: coords.clientX,
                            y: coords.clientY,
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
                          const coords = getEventCoords(e);

                          const centerX = elRect.left + elRect.width / 2;
                          const centerY = elRect.top + elRect.height / 2;

                          rotateStart.current = {
                            startAngle: Math.atan2(coords.clientY - centerY, coords.clientX - centerX),
                            centerX,
                            centerY,
                          };

                          setRotatingId(sticker.id);
                          onSelect(sticker.id);
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          e.preventDefault();

                          const rect = canvasRef.current!.getBoundingClientRect();
                          const elRect = e.currentTarget.parentElement!.getBoundingClientRect();
                          const coords = getEventCoords(e);

                          const centerX = elRect.left + elRect.width / 2;
                          const centerY = elRect.top + elRect.height / 2;

                          rotateStart.current = {
                            startAngle: Math.atan2(coords.clientY - centerY, coords.clientX - centerX),
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
      </div>
    );
  }
);

export default Canvas;
