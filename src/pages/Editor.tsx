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
import { TextElement } from "../types/editor";
import { templates } from '../data/templates';
import { DUAS } from '../data/duas';
import { STICKERS } from '../data/stickers';
import { MdTextFields, MdEmojiEmotions, MdImage, MdPalette, MdContentCopy, MdMenu, MdClose } from "react-icons/md";
import { FiTrash } from "react-icons/fi";
import UndoRedoContainer from '../components/UI/UndoRedoContainer';

const Editor = () => {

  const canvasRef = useRef<HTMLDivElement & CanvasHandle>(null);
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

      const preloadAndDecodeImage = async (src?: string) => {
        if (!src) return;
      
        return new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
      
          img.onload = async () => {
            try {
              if (img.decode) {
                await img.decode(); // 🔥 critical for iOS
              }
            } catch {}
      
            requestAnimationFrame(() => {
              requestAnimationFrame(() => resolve());
            });
          };
      
          img.onerror = reject;
          img.src = src;
        });
      };
      

      const handleDownload = async () => {
        if (!canvasRef.current) return;
      
        try {
          const element = canvasRef.current;
      
          // wait for images (stickers etc.)
          if (typeof element.waitForImages === "function") {
            await element.waitForImages();
          }
      
          // wait for fonts
          if (document.fonts?.ready) {
            await document.fonts.ready;
          }

          // wait for background decode (iOS fix)
          if (state.previewImage) {
            await preloadAndDecodeImage(state.previewImage);
          }

      
          const dataUrl = await toPng(element, {
            cacheBust: false,
            pixelRatio: window.devicePixelRatio || 2,
            backgroundColor: state.background || "#ffffff",
          });
      
          const link = document.createElement("a");
          link.download = "ramadan-card.png";
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      
        } catch (e) {
          console.error("Download failed", e);
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
                background={
                  state.previewImage
                    ? `url(${state.previewImage}) center/cover`
                    : state.background
                }
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
