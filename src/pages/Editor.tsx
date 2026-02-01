import { useEffect, useRef, useState } from 'react';
import { toPng } from "html-to-image";
import Canvas from "../components/Editor/Canvas";
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
import { TextElement } from "../types/editor";
import { templates } from '../data/templates';
import { DUAS } from '../data/duas';
import { STICKERS } from '../data/stickers';
import { MdTextFields, MdEmojiEmotions, MdImage, MdPalette, MdContentCopy, MdMenu, MdClose } from "react-icons/md";
import { FiTrash } from "react-icons/fi";
import UndoRedoContainer from '../components/UI/UndoRedoContainer';

const Editor = () => {

  const canvasRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const { state, addText, selectElement, clearSelection, updateTextElement, moveElement, addSticker, resizeElement, rotateElement, deleteSelected, setBackground, bringForward, sendBackward, applyTemplate, addDuaText, undo, redo, duplicateSelected, canRedo, canUndo } = useEditor();
  const [showStickers, setShowStickers] = useState(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(false);  

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
      

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    try {
      // Simple function to wait for an image to load
      const waitForImage = (img: HTMLImageElement): Promise<void> => {
        return new Promise((resolve) => {
          // Check if already loaded
          if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
            resolve();
            return;
          }
          
          // Wait for load or error
          const timeout = setTimeout(() => resolve(), 10000);
          const cleanup = () => {
            clearTimeout(timeout);
            img.removeEventListener('load', onLoad);
            img.removeEventListener('error', onError);
          };
          
          const onLoad = () => {
            cleanup();
            resolve();
          };
          
          const onError = () => {
            cleanup();
            resolve(); // Continue even if image fails
          };
          
          img.addEventListener('load', onLoad, { once: true });
          img.addEventListener('error', onError, { once: true });
        });
      };

      // If template background exists, ensure it's rendered in DOM
      if (state.previewImage) {
        // Wait for React to render
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Get all images from canvas
      let images = canvasRef.current.querySelectorAll('img');
      
      // If template exists but no images found, wait a bit more
      if (state.previewImage && images.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
        images = canvasRef.current.querySelectorAll('img');
      }

      // Wait for all images to load
      if (images.length > 0) {
        await Promise.all(Array.from(images).map(img => waitForImage(img as HTMLImageElement)));
      }
      
      // Small delay to ensure browser has painted everything
      await new Promise(resolve => setTimeout(resolve, 150));

      const dataUrl = await toPng(canvasRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      
      // Mobile-friendly download
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Try Web Share API first (works on modern mobile browsers)
        if (navigator.share && navigator.canShare) {
          try {
            // Convert data URL to blob
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const file = new File([blob], 'ramadan-card.png', { type: 'image/png' });
            
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: 'Ramadan Card',
              });
              return; // Successfully shared
            }
          } catch (shareError) {
            console.log('Share API failed, falling back to download:', shareError);
            // Fall through to blob download
          }
        }
        
        // Fallback: Create blob and download
        try {
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          
          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = "ramadan-card.png";
          link.style.display = 'none';
          document.body.appendChild(link);
          
          // Trigger download
          link.click();
          
          // Clean up after a delay
          setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
          }, 100);
        } catch (blobError) {
          // Last resort: open in new tab
          const newWindow = window.open();
          if (newWindow) {
            newWindow.document.write(`
              <html>
                <head><title>Ramadan Card</title></head>
                <body style="margin:0;padding:20px;background:#f0f0f0;display:flex;justify-content:center;align-items:center;min-height:100vh;">
                  <div style="text-align:center;">
                    <img src="${dataUrl}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
                    <p style="margin-top:20px;color:#666;">Long press the image to save</p>
                  </div>
                </body>
              </html>
            `);
            newWindow.document.close();
          } else {
            alert("Please allow popups to download your card, or use the share button.");
          }
        }
      } else {
        // Desktop download
        const link = document.createElement("a");
        link.download = "ramadan-card.png";
        link.href = dataUrl;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error("Failed to download image:", err);
      alert("Failed to download card. Please try again.");
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
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
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
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gray-200 rounded-md hover:bg-gray-300"
            onClick={handleDownload}
          >
            <span className="hidden sm:inline">{t('editor.navbar.buttonText')}</span>
            <span className="sm:hidden">Download</span>
          </button>
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <button
            onClick={() => setShowRightSidebar(!showRightSidebar)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
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
                className="absolute top-2 right-2 p-1 rounded-md hover:bg-gray-100 lg:hidden"
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
              />

              <SidebarButton
                label={t('editor.optionsSidebar.AddBackgroundBtn')}
                color="purple"
                icon={<MdPalette />}
                onClick={() => setShowLeftSidebar(false)}
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
          />

          <SidebarButton
            label={t('editor.optionsSidebar.AddBackgroundBtn')}
            color="purple"
            icon={<MdPalette />}
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
                background={state.previewImage ? `url(${state.previewImage}) center/cover` : state.background}
                previewImage={state.previewImage}
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
                  className="p-1 rounded-md hover:bg-gray-100"
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
                    className="w-full py-2 text-sm text-center bg-gray-100 rounded hover:bg-gray-200"
                  >
                    {t('editor.controlsSidebar.layerOptions.forward')}
                  </button>

                  <button
                    onClick={() => sendBackward(singleSelectedId)}
                    className="w-full py-2 text-sm text-center bg-gray-100 rounded hover:bg-gray-200"
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
                className="w-full py-2 text-sm text-center bg-gray-100 rounded hover:bg-gray-200"
              >
                {t('editor.controlsSidebar.layerOptions.forward')}
              </button>

              <button
                onClick={() => sendBackward(singleSelectedId)}
                className="w-full py-2 text-sm text-center bg-gray-100 rounded hover:bg-gray-200"
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
