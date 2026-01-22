import { useRef } from 'react';
import { toPng } from "html-to-image";
import Canvas from "../components/Editor/Canvas";
import TextControls from "../components/Editor/TextControls";
import BackgroundControls from "../components/Editor/BackgroundControls";
import TemplatesPanel from '../components/Editor/TemplatesPanel';
import SidebarButton from '../components/UI/SidebarButton';
import DuaPanel from '../components/Editor/DuaPanel';
import DuaBar from '../components/Editor/DuaBar';
import { useEditor } from "../hooks/useEditor";
import { TextElement } from "../types/editor";
import { templates } from '../data/templates';
import { DUAS } from '../data/duas';
import { MdTextFields, MdEmojiEmotions, MdImage, MdPalette } from "react-icons/md";

const Editor = () => {

  const canvasRef = useRef<HTMLDivElement>(null);
  const { state, addText, selectElement, clearSelection, updateTextElement, moveElement, addSticker, resizeElement, rotateElement, deleteSelected, setBackground, bringForward, sendBackward, applyTemplate, addDuaText } = useEditor();

  const selectedElement =
    state.selectedElementIds.length === 1
      ? state.elements.find(
        (el) => el.id === state.selectedElementIds[0]
      )
      : undefined;
  const selectedText =
    state.selectedElementIds.length === 1
      ? (state.elements.find(
        (el) =>
          el.id === state.selectedElementIds[0] &&
          el.type === "text"
      ) as TextElement | undefined)
      : undefined;

  const singleSelectedId =
    state.selectedElementIds.length === 1
      ? state.selectedElementIds[0]
      : null;

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = await toPng(canvasRef.current, { cacheBust: true });
      const link = document.createElement("a");
      link.download = "eid-card.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download image:", err);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="h-16 bg-white border-b flex items-center justify-between px-6">
        <div className="font-semibold text-lg">Eidora</div>

        <div className="text-sm text-gray-500">Card Editor</div>

        <button
          className="px-4 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
          onClick={handleDownload}
        >
          Download
        </button>
      </header>

      {/* Main Editor Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Toolbar */}
        <aside className="w-24 bg-white border-r flex flex-col items-center py-4 gap-4">
          <SidebarButton
            label="Text"
            color="blue"
            icon={<MdTextFields />}
            onClick={addText}
          />

          <SidebarButton
            label="Sticker"
            color="yellow"
            icon={<MdEmojiEmotions />}
            onClick={() =>
              addSticker("/assets/stickers/icons8-ramadan-48.png")
            }
          />

          <SidebarButton
            label="Image"
            color="green"
            icon={<MdImage />}
          />

          <SidebarButton
            label="Background"
            color="purple"
            icon={<MdPalette />}
          />
        </aside>


        {/* Canvas Area */}
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center">
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
            />
            <div className="w-full border-t pt-4 m-20"></div>
            <DuaBar
              duas={DUAS}
              onSelect={(text) => addDuaText(text)}
            />
          </div>
        </main>

        {/* Right Controls Panel */}
        <aside className="w-72 bg-white border-l p-4 flex flex-col">
          <h3 className="font-medium mb-3">Controls</h3>

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
                className="w-full py-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
              >
                Bring Forward
              </button>

              <button
                onClick={() => sendBackward(singleSelectedId)}
                className="w-full py-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
              >
                Send Backward
              </button>
            </div>
          )}

          <TemplatesPanel onSelect={applyTemplate} templates={templates} />

          {/* <DuaPanel
            duas={ramadanDuas}
            onSelect={addDuaText}
          /> */}


          {/* DELETE BUTTON */}
          {state.selectedElementIds.length > 0 && (
            <button
              onClick={deleteSelected}
              className="
                mt-auto
                w-full
                py-2
                text-sm
                bg-red-100
                text-red-600
                rounded-md
                hover:bg-red-200
              "
            >
              Delete Element
            </button>
          )}

        </aside>


      </div>
    </div>
  );
};

export default Editor;
