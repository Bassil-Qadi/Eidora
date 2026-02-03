import { useEffect, useRef, useState } from 'react';
import { toPng } from "html-to-image";
import Canvas, { CanvasHandle } from "../components/Editor/Canvas";
import TextControls from "../components/Editor/TextControls";
import BackgroundControls from "../components/Editor/BackgroundControls";
import TemplatesPanel from '../components/Editor/TemplatesPanel';
import SidebarButton from '../components/UI/SidebarButton';
import StickerPicker from '../components/Editor/StickerPicker';
import DuaBar from '../components/Editor/DuaBar';
import Button from '../components/UI/Button';
import { LanguageSwitcher } from '../components/UI/LanguageSwitcher';
import { useEditor } from "../hooks/useEditor";
import { useLanguage } from "../hooks/useLanguage";
import { TextElement, ImageElement } from "../types/editor";
import { templates } from '../data/templates';
import { DUAS } from '../data/duas';
import { STICKERS } from '../data/stickers';
import { MdTextFields, MdEmojiEmotions, MdImage, MdPalette, MdContentCopy, MdMenu, MdClose } from "react-icons/md";
import { FiTrash } from "react-icons/fi";
import UndoRedoContainer from '../components/UI/UndoRedoContainer';

const CARD_BASE_WIDTH = 360;
const CARD_BASE_HEIGHT = 580;

const Editor = () => {

  const canvasRef = useRef<HTMLDivElement & CanvasHandle>(null);
  const { t } = useLanguage();
  const { state, addText, selectElement, clearSelection, updateTextElement, moveElement, addSticker, resizeElement, rotateElement, deleteSelected, setBackground, bringForward, sendBackward, applyTemplate, addDuaText, undo, redo, duplicateSelected, canRedo, canUndo } = useEditor();
  const [showStickers, setShowStickers] = useState(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(false);  
  const [resolvedPreviewImage, setResolvedPreviewImage] = useState<string | undefined>(undefined);

  const selectedElement =
    state?.selectedElementIds?.length === 1
      ? state.elements.find(
        (el) => el.id === state.selectedElementIds[0]
      )
      : undefined;
  const selectedText =
    state?.selectedElementIds?.length === 1
      ? (state.elements.find(
        (el) =>
          el.id === state.selectedElementIds[0] &&
          el.type === "text"
      ) as TextElement | undefined)
      : undefined;

  const singleSelectedId =
    state?.selectedElementIds?.length === 1
      ? state.selectedElementIds[0]
      : null;

      useEffect(() => {
        const handler = (e: KeyboardEvent) => {
          if (e.ctrlKey && e.key === "z" && !e.shiftKey) {
            e.preventDefault();
            undo();
          }
      
          if (
            (e.ctrlKey && e.shiftKey && e.key === "z") ||
            (e.ctrlKey && e.key === "y")
          ) {
            e.preventDefault();
            redo();
          }
        };
      
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
      }, []);

      // Detect iOS Safari
      const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

      const fetchImageAsDataUrl = async (url: string, signal?: AbortSignal): Promise<string> => {
        const res = await fetch(url, { cache: "force-cache", signal });
        if (!res.ok) {
          throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
        }
        const blob = await res.blob();

        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error ?? new Error("Failed to read image blob"));
          reader.readAsDataURL(blob);
        });
      };

      const forceIOSRepaint = async (element: HTMLElement) => {
        element.style.transform = "translateZ(0)";
        await new Promise((r) => requestAnimationFrame(r));
        element.style.transform = "";
        // Additional repaint frames for iOS
        if (isIOSSafari) {
          await new Promise((r) => requestAnimationFrame(r));
          await new Promise((r) => requestAnimationFrame(r));
        }
      };
      
      const waitForDOMImage = async (imgElement: HTMLImageElement | null): Promise<void> => {
        if (!imgElement) return;
        
        return new Promise<void>((resolve) => {
          let resolved = false;
          const doResolve = () => {
            if (!resolved) {
              resolved = true;
              resolve();
            }
          };
          
          // Check if already loaded with valid dimensions
          if (imgElement.complete && imgElement.naturalWidth > 0 && imgElement.naturalHeight > 0) {
            // Image is loaded, but ensure it's painted on iOS
            if (isIOSSafari) {
              // Multiple animation frames to ensure paint
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    doResolve();
                  });
                });
              });
            } else {
              requestAnimationFrame(() => doResolve());
            }
            return;
          }
          
          // Wait for load event
          const onLoad = () => {
            imgElement.removeEventListener('load', onLoad);
            imgElement.removeEventListener('error', onError);
            // Extra frames for iOS to ensure painting
            if (isIOSSafari) {
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    doResolve();
                  });
                });
              });
            } else {
              requestAnimationFrame(() => doResolve());
            }
          };
          
          const onError = () => {
            imgElement.removeEventListener('load', onLoad);
            imgElement.removeEventListener('error', onError);
            doResolve(); // Resolve even on error to not block
          };
          
          imgElement.addEventListener('load', onLoad);
          imgElement.addEventListener('error', onError);
        });
      };
      
      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
          img.src = src;
        });
      };

      const exportWithCanvasForIOS = async () => {
        // High-resolution offscreen canvas based on design size
        const scale = Math.max(2, Math.floor((window.devicePixelRatio || 2)));
        const canvas = document.createElement("canvas");
        canvas.width = CARD_BASE_WIDTH * scale;
        canvas.height = CARD_BASE_HEIGHT * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Draw background (template image if present)
        const bgSrc = resolvedPreviewImage ?? state.previewImage;
        if (bgSrc) {
          try {
            const bgImg = await loadImage(bgSrc);
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
          } catch {
            // Fallback: solid fill if background is a simple color
            ctx.fillStyle = state.background || "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
        } else {
          ctx.fillStyle = state.background || "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Cache for sticker/image assets
        const imageCache = new Map<string, HTMLImageElement>();
        const getCachedImage = async (src: string) => {
          if (imageCache.has(src)) return imageCache.get(src)!;
          const img = await loadImage(src);
          imageCache.set(src, img);
          return img;
        };

        const toRadians = (deg?: number) => ((deg ?? 0) * Math.PI) / 180;

        // Draw elements
        for (const el of state.elements) {
          if (el.type === "sticker" || el.type === "image") {
            const sticker = el as ImageElement;
            try {
              const img = await getCachedImage(sticker.src);
              const centerX = (sticker.x / 100) * CARD_BASE_WIDTH * scale;
              const centerY = (sticker.y / 100) * CARD_BASE_HEIGHT * scale;
              const drawWidth = sticker.width * scale;
              const drawHeight = sticker.height * scale;

              ctx.save();
              ctx.translate(centerX, centerY);
              ctx.rotate(toRadians(sticker.rotation));
              ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
              ctx.restore();
            } catch {
              // Skip images that fail to load
              continue;
            }
          } else if (el.type === "text") {
            const text = el as TextElement;
            const centerX = (text.x / 100) * CARD_BASE_WIDTH * scale;
            const centerY = (text.y / 100) * CARD_BASE_HEIGHT * scale;
            const maxWidth = (text.width ?? 200) * scale;

            const fontSize = text.fontSize * scale;
            const fontFamily = text.fontFamily || "Cairo";
            const fontWeight = text.bold ? "700" : "400";
            const fontStyle = text.italic ? "italic" : "normal";

            ctx.save();
            ctx.fillStyle = text.color;
            ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
            ctx.textAlign = text.align ?? "center";
            ctx.textBaseline = "middle";

            const lineHeight = fontSize * 1.3;
            const lines = (text.text || "").split("\n");
            const totalHeight = lines.length * lineHeight;
            let currentY = centerY - totalHeight / 2 + lineHeight / 2;

            for (const line of lines) {
              ctx.fillText(line, centerX, currentY, maxWidth);
              currentY += lineHeight;
            }

            // Simple underline approximation (under the first line width)
            if (text.underline && lines.length > 0) {
              const metrics = ctx.measureText(lines[0]);
              const underlineWidth = Math.min(maxWidth, metrics.width);
              let startX = centerX;
              if ((ctx.textAlign as CanvasTextAlign) === "center") {
                startX -= underlineWidth / 2;
              } else if ((ctx.textAlign as CanvasTextAlign) === "right") {
                startX -= underlineWidth;
              }
              const underlineY = centerY + totalHeight / 2;

              ctx.beginPath();
              ctx.moveTo(startX, underlineY);
              ctx.lineTo(startX + underlineWidth, underlineY);
              ctx.lineWidth = Math.max(1, fontSize / 15);
              ctx.strokeStyle = text.color;
              ctx.stroke();
            }

            ctx.restore();
          }
        }

        // Ensure fonts are ready before extracting the image (especially for custom fonts)
        if (document.fonts?.ready) {
          try {
            await document.fonts.ready;
          } catch {
            // ignore font readiness errors
          }
        }

        const dataUrl = canvas.toDataURL("image/png");

        // iOS-specific download handling
        // For iOS Safari, we need to handle downloads differently
        if (isIOSSafari) {
          // Try using the download attribute first (works on iOS 13+)
          const link = document.createElement("a");
          link.download = "ramadan-card.png";
          link.href = dataUrl;
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          
          // Clean up after a delay
          setTimeout(() => {
            document.body.removeChild(link);
          }, 100);
        } else {
          // Standard download for other browsers
          const link = document.createElement("a");
          link.download = "ramadan-card.png";
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      };

      const handleDownload = async () => {
        if (!canvasRef.current) return;
      
        const element = canvasRef.current;
      
        try {
          // On iOS, when a template image is active, use a dedicated canvas-based export
          // to avoid html-to-image bugs with first-load images.
          if (isIOSSafari && (resolvedPreviewImage || state.previewImage)) {
            await exportWithCanvasForIOS();
            return;
          }

          // Ensure the template background is a resolved data URL before capture.
          // This prevents html-to-image from racing a first-time network fetch on iOS.
          if (state.previewImage && !resolvedPreviewImage) {
            try {
              const dataUrl = await fetchImageAsDataUrl(state.previewImage);
              setResolvedPreviewImage(dataUrl);
              // Wait for React to paint the new src into the DOM
              await new Promise((r) => requestAnimationFrame(r));
              await new Promise((r) => requestAnimationFrame(r));
            } catch {
              // ignore and let it proceed with original url
            }
          }

          // ✅ Step 1: Wait for all images to decode and load
          if (typeof element.waitForImages === "function") {
            await element.waitForImages();
          }
      
          // ✅ Step 2: Explicitly wait for the DOM image element (CRITICAL for iOS)
          // This ensures the actual rendered image in the DOM is loaded and painted
          if ((resolvedPreviewImage || state.previewImage) && typeof element.getPreviewImageElement === "function") {
            const previewImgElement = element.getPreviewImageElement();
            if (previewImgElement) {
              await waitForDOMImage(previewImgElement);
              
              // ✅ Step 3: Additional iOS-specific wait to ensure image is painted
              if (isIOSSafari) {
                // Verify the image has valid dimensions (painted)
                let attempts = 0;
                while (attempts < 10 && (!previewImgElement.naturalWidth || previewImgElement.naturalWidth === 0)) {
                  await new Promise(r => setTimeout(r, 50));
                  attempts++;
                }
                
                // Extra delay for iOS Safari to ensure rendering
                await new Promise(r => setTimeout(r, 100));
              }
            }
          }
      
          // ✅ Step 4: Wait for fonts (CRITICAL for iOS)
          if (document.fonts?.ready) {
            await document.fonts.ready;
          }
      
          // ✅ Step 5: Force repaint so everything is painted before capture
          await forceIOSRepaint(element);
          
          // ✅ Step 6: Additional iOS-specific delay before capture
          if (isIOSSafari) {
            await new Promise(r => setTimeout(r, 50));
          }
      
          const dataUrl = await toPng(element, {
            // cacheBust can force a refetch inside html-to-image; avoid it since we pre-resolve the src
            cacheBust: false,
            pixelRatio: window.devicePixelRatio || 2,
            backgroundColor: state.background || "#ffffff",
          });
      
          // iOS-specific download handling
          if (isIOSSafari) {
            // For iOS Safari, create a link and trigger download
            const link = document.createElement("a");
            link.download = "ramadan-card.png";
            link.href = dataUrl;
            link.style.display = "none";
            document.body.appendChild(link);
            link.click();
            
            // Clean up after a delay
            setTimeout(() => {
              if (link.parentNode) {
                document.body.removeChild(link);
              }
            }, 100);
          } else {
            // Standard download for other browsers
            const link = document.createElement("a");
            link.download = "ramadan-card.png";
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        } catch (e) {
          console.error("Download failed", e);
          // Fallback: try to open image in new tab if download fails
          try {
            const dataUrl = await toPng(element, {
              cacheBust: false,
              pixelRatio: 1,
              backgroundColor: state.background || "#ffffff",
            });
            const newWindow = window.open();
            if (newWindow) {
              newWindow.document.write(`<img src="${dataUrl}" alt="Ramadan Card" />`);
            }
          } catch (fallbackError) {
            console.error("Fallback download also failed", fallbackError);
          }
        }
      };
      
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="h-16 bg-white border-b flex items-center justify-between px-4 sm:px-6">
        {/* <div className="font-semibold text-lg">Eidora</div> */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setShowLeftSidebar(!showLeftSidebar)}
            className="flex items-center justify-center lg:hidden p-2 rounded-md hover:bg-gray-100"
            aria-label="Toggle left sidebar"
          >
            <MdMenu className="text-xl" />
          </button>
          <div>
            <h2 className="text-lg sm:text-2xl font-semibold text-gold mb-0">
              {t("ramadan.title")}
            </h2>
            <small className="hidden sm:block text-xs">{t("ramadan.greeting")}</small>
          </div>
        </div>

        <div className="hidden sm:block text-sm text-gray-500">{t('editor.navbar.title')}</div>

        <div className='flex items-center gap-2 sm:gap-4'>
          <button
            className="flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gray-200 rounded-md hover:bg-gray-300"
            onClick={handleDownload}
          >
            {t('editor.navbar.buttonText')}
          </button>
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <button
            onClick={() => setShowRightSidebar(!showRightSidebar)}
            className="flex items-center justify-center lg:hidden p-2 rounded-md hover:bg-gray-100"
            aria-label="Toggle right sidebar"
          >
            <MdMenu className="text-xl" />
          </button>
        </div>
      </header>

      {/* Main Editor Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Left Sidebar Overlay */}
        {showLeftSidebar && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setShowLeftSidebar(false)}
            />
            <aside className="fixed left-0 top-16 bottom-0 w-24 bg-white border-r flex flex-col items-center py-4 gap-4 z-50 lg:hidden">
              <button
                onClick={() => setShowLeftSidebar(false)}
                className="flex items-center justify-center absolute top-2 right-2 p-1 rounded-md hover:bg-gray-100 lg:hidden"
                aria-label="Close sidebar"
              >
                <MdClose className="text-xl" />
              </button>
              <SidebarButton
                label={t('editor.optionsSidebar.addTextBtn')}
                color="blue"
                icon={<MdTextFields />}
                onClick={() => {
                  addText();
                  setShowLeftSidebar(false);
                }}
              />

              <SidebarButton
                label={t('editor.optionsSidebar.addStickerBtn')}
                color="yellow"
                icon={<MdEmojiEmotions />}
                onClick={() => {
                  setShowStickers((v) => !v);
                  setShowLeftSidebar(false);
                }}
              />

              <SidebarButton
                label={t('editor.optionsSidebar.AddImageBtn')}
                color="green"
                icon={<MdImage />}
                onClick={() => setShowLeftSidebar(false)}
                disabled={true}
                className="cursor-not-allowed hover:bg-green-50 hover:shadow-none"
              />

              <SidebarButton
                label={t('editor.optionsSidebar.AddBackgroundBtn')}
                color="purple"
                icon={<MdPalette />}
                onClick={() => setShowLeftSidebar(false)}
                disabled={true}
                className="cursor-not-allowed hover:bg-purple-50 hover:shadow-none"
              />
            </aside>
          </>
        )}

        {/* Desktop Left Toolbar */}
        <aside className="hidden lg:flex w-24 bg-white border-r flex-col items-center py-4 gap-4">
          <SidebarButton
            label={t('editor.optionsSidebar.addTextBtn')}
            color="blue"
            icon={<MdTextFields />}
            onClick={addText}
          />

          <SidebarButton
            label={t('editor.optionsSidebar.addStickerBtn')}
            color="yellow"
            icon={<MdEmojiEmotions />}
            onClick={() => setShowStickers((v) => !v)}
          />

          <SidebarButton
            label={t('editor.optionsSidebar.AddImageBtn')}
            color="green"
            icon={<MdImage />}
            disabled={true}
            className="cursor-not-allowed hover:bg-green-50 hover:shadow-none"
          />

          <SidebarButton
            label={t('editor.optionsSidebar.AddBackgroundBtn')}
            className="cursor-not-allowed hover:bg-purple-50 hover:shadow-none"
            color="purple"
            icon={<MdPalette />}
            disabled={true}
          />
        </aside>


        {/* Canvas Area */}
        <main className="flex-1 flex items-center justify-center bg-gray-50 overflow-y-auto p-2 sm:p-4">
          <div className="flex flex-col items-center w-full max-w-full">
            <UndoRedoContainer
              undo={undo}
              redo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
            />
            <div className="w-full flex justify-center">
              <Canvas
                ref={canvasRef}
                elements={state.elements}
                selectedElementId={singleSelectedId}
                selectedElementIds={state.selectedElementIds}
                onSelect={selectElement}
                onMove={moveElement}
                onUpdate={updateTextElement}
                onResize={resizeElement}
                onRotate={rotateElement}
                onDelete={(id) => deleteSelected()}
                background={(resolvedPreviewImage ?? state.previewImage) ? `url(${resolvedPreviewImage ?? state.previewImage}) center/cover` : state.background}
                previewImage={resolvedPreviewImage ?? state.previewImage}
                onClearSelection={clearSelection}
                duplicateSelected={duplicateSelected}
              />
            </div>
            <div className="w-full max-w-4xl border-t pt-4 mt-4 sm:mt-8 mb-4 sm:mb-8"></div>
            <div className="w-full max-w-4xl px-2 sm:px-4">
              <DuaBar
                duas={DUAS}
                onSelect={(text) => addDuaText(text)}
              />
            </div>
          </div>
        </main>

        {/* Mobile Right Sidebar Overlay */}
        {showRightSidebar && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setShowRightSidebar(false)}
            />
            <aside className="fixed right-0 top-16 bottom-0 w-80 bg-white border-l p-4 flex flex-col z-50 overflow-y-auto lg:hidden">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">{t('editor.controlsSidebar.title')}</h3>
                <button
                  onClick={() => setShowRightSidebar(false)}
                  className="flex items-center justify-center p-1 rounded-md hover:bg-gray-100"
                  aria-label="Close sidebar"
                >
                  <MdClose className="text-xl" />
                </button>
              </div>

              {/* TEXT CONTROLS */}
              {selectedText && (
                <TextControls
                  text={selectedText}
                  onChange={(updates) =>
                    updateTextElement(selectedText.id, updates)
                  }
                />
              )}

              {/* BACKGROUND CONTROLS */}
              {state.selectedElementIds.length === 0 && (
                <BackgroundControls
                  value={state.background}
                  onChange={setBackground}
                />
              )}

              {/* STICKER / IMAGE CONTROLS placeholder */}
              {selectedElement && selectedElement.type !== "text" && (
                <p className="text-sm text-gray-400">
                  Sticker/Image controls coming soon
                </p>
              )}

              {singleSelectedId && (
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => bringForward(singleSelectedId)}
                    className="flex items-center justify-center w-full py-2 text-sm text-center bg-gray-100 rounded hover:bg-gray-200"
                  >
                    {t('editor.controlsSidebar.layerOptions.forward')}
                  </button>

                  <button
                    onClick={() => sendBackward(singleSelectedId)}
                    className="flex items-center justify-center w-full py-2 text-sm text-center bg-gray-100 rounded hover:bg-gray-200"
                  >
                    {t('editor.controlsSidebar.layerOptions.backward')}
                  </button>
                </div>
              )}

              <TemplatesPanel onSelect={applyTemplate} templates={templates} />

              {showStickers && (
                <StickerPicker
                  stickers={STICKERS}
                  onSelect={(src) => {
                    addSticker(src);
                    setShowStickers(false);
                  }}
                />
              )}

              <div className='mt-auto flex flex-col items-center gap-2 pt-4'>
              {state.selectedElementIds.length > 0 && (
                <Button
                  onClick={duplicateSelected}
                  className="w-full py-2 text-sm bg-indigo-100 text-indigo-700 text-center rounded-md hover:bg-indigo-200 transition"
                  icon={<MdContentCopy />}
                >
                  {t('editor.controlsSidebar.duplicateElementBtn')}
                </Button>
              )}

              {/* DELETE BUTTON */}
              {state.selectedElementIds.length > 0 && (
                <Button
                  onClick={deleteSelected}
                  className="
                    w-full
                    text-center
                    py-2
                    text-sm
                    bg-red-100
                    text-red-600
                    rounded-md
                    hover:bg-red-200
                  "
                  icon={<FiTrash />}
                >
                  {t('editor.controlsSidebar.deleteElementBtn')}
                </Button>
              )}
              </div>
            </aside>
          </>
        )}

        {/* Desktop Right Controls Panel */}
        <aside className="hidden lg:flex w-72 bg-white border-l p-4 flex-col overflow-y-auto">
          <h3 className="font-medium mb-3">{t('editor.controlsSidebar.title')}</h3>

          {/* TEXT CONTROLS */}
          {selectedText && (
            <TextControls
              text={selectedText}
              onChange={(updates) =>
                updateTextElement(selectedText.id, updates)
              }
            />
          )}

          {/* BACKGROUND CONTROLS */}
          {state.selectedElementIds.length === 0 && (
            <BackgroundControls
              value={state.background}
              onChange={setBackground}
            />
          )}

          {/* STICKER / IMAGE CONTROLS placeholder */}
          {selectedElement && selectedElement.type !== "text" && (
            <p className="text-sm text-gray-400">
              Sticker/Image controls coming soon
            </p>
          )}

          {singleSelectedId && (
            <div className="mt-4 space-y-2">
              <button
                onClick={() => bringForward(singleSelectedId)}
                className="flex items-center justify-center w-full py-2 text-sm text-center bg-gray-100 rounded hover:bg-gray-200"
              >
                {t('editor.controlsSidebar.layerOptions.forward')}
              </button>

              <button
                onClick={() => sendBackward(singleSelectedId)}
                className="flex items-center justify-center w-full py-2 text-sm text-center bg-gray-100 rounded hover:bg-gray-200"
              >
                {t('editor.controlsSidebar.layerOptions.backward')}
              </button>
            </div>
          )}

          <TemplatesPanel onSelect={applyTemplate} templates={templates} />

          {showStickers && (
            <StickerPicker
              stickers={STICKERS}
              onSelect={(src) => {
                addSticker(src);
                setShowStickers(false);
              }}
            />
          )}

          <div className='mt-auto flex flex-col items-center gap-2 pt-4'>
          {state.selectedElementIds.length > 0 && (
            <Button
              onClick={duplicateSelected}
              className="w-full py-2 text-sm bg-indigo-100 text-indigo-700 text-center rounded-md hover:bg-indigo-200 transition"
              icon={<MdContentCopy />}
            >
              {t('editor.controlsSidebar.duplicateElementBtn')}
            </Button>
          )}

          {/* DELETE BUTTON */}
          {state.selectedElementIds.length > 0 && (
            <Button
              onClick={deleteSelected}
              className="
                w-full
                text-center
                py-2
                text-sm
                bg-red-100
                text-red-600
                rounded-md
                hover:bg-red-200
              "
              icon={<FiTrash />}
            >
              {t('editor.controlsSidebar.deleteElementBtn')}
            </Button>
          )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Editor;
