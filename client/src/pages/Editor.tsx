import { useState, useRef, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import CustomizationPanel from '@/components/CustomizationPanel';
import {
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Plus,
  ChevronUp,
  ChevronDown,
  Type,
  Image,
  Square,
  Music,
  Video,
  Palette,
  Settings,
} from 'lucide-react';

interface Element {
  id: number;
  projectId: number;
  elementType: string;
  layerIndex: number;
  x: number | null;
  y: number | null;
  width: number | null;
  height: number | null;
  rotation: number | null;
  opacity: number | null;
  zIndex: number | null;
  content?: string | null;
  style?: string | null;
  animation?: string | null;
  visible: number | null;
  locked: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DragState {
  elementId: number | null;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  mode: 'move' | 'resize' | null;
}

/**
 * Visual Template Editor with Drag & Drop
 */
export default function Editor() {
  const projectId = new URLSearchParams(window.location.search).get('projectId');
  const [elements, setElements] = useState<Element[]>([]);
  const [selectedElement, setSelectedElement] = useState<number | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    elementId: null,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    mode: null,
  });
  const canvasRef = useRef<HTMLDivElement>(null);
  const [showCustomization, setShowCustomization] = useState(false);

  // API calls
  const getElements = trpc.editor.elements.getAll.useQuery(
    { projectId: projectId ? parseInt(projectId) : 0 },
    { enabled: !!projectId }
  );

  const createElement = trpc.editor.elements.create.useMutation();
  const updatePosition = trpc.editor.elements.updatePosition.useMutation();
  const deleteElementMutation = trpc.editor.elements.delete.useMutation();
  const duplicateElementMutation = trpc.editor.elements.duplicate.useMutation();
  const updateVisibility = trpc.editor.elements.updateVisibility.useMutation();

  useEffect(() => {
    if (getElements.data?.elements) {
      setElements(getElements.data.elements);
    }
  }, [getElements.data]);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on resize handle
    if (selectedElement) {
      const element = elements.find((el) => el.id === selectedElement);
      if (element) {
        const handleSize = 10;
        const elementX = element.x || 0;
        const elementY = element.y || 0;
        const elementWidth = element.width || 100;
        const elementHeight = element.height || 100;
        const isResizing =
          x > elementX + elementWidth - handleSize &&
          x < elementX + elementWidth &&
          y > elementY + elementHeight - handleSize &&
          y < elementY + elementHeight;

        if (isResizing) {
          setDragState({
            elementId: selectedElement,
            startX: x,
            startY: y,
            startWidth: element.width || 100,
            startHeight: element.height || 100,
            mode: 'resize',
          });
          return;
        }
      }
    }

    // Otherwise, start moving
    if (selectedElement) {
      const element = elements.find((el) => el.id === selectedElement);
      if (element) {
        setDragState({
          elementId: selectedElement,
          startX: x,
          startY: y,
          startWidth: element.width || 100,
          startHeight: element.height || 100,
          mode: 'move',
        });
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!dragState.mode || !dragState.elementId || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const element = elements.find((el) => el.id === dragState.elementId);
    if (!element) return;

    if (dragState.mode === 'move') {
      const deltaX = x - dragState.startX;
      const deltaY = y - dragState.startY;

      setElements((prev) =>
        prev.map((el) =>
          el.id === dragState.elementId
            ? {
                ...el,
                x: Math.max(0, (element.x || 0) + deltaX),
                y: Math.max(0, (element.y || 0) + deltaY),
              }
            : el
        )
      );
    } else if (dragState.mode === 'resize') {
      const deltaX = x - dragState.startX;
      const deltaY = y - dragState.startY;

      setElements((prev) =>
        prev.map((el) =>
          el.id === dragState.elementId
            ? {
                ...el,
                width: Math.max(50, dragState.startWidth + deltaX),
                height: Math.max(50, dragState.startHeight + deltaY),
              }
            : el
        )
      );
    }
  };

  const handleCanvasMouseUp = async () => {
    if (!dragState.elementId || !dragState.mode) return;

    const element = elements.find((el) => el.id === dragState.elementId);
    if (element) {
      await updatePosition.mutateAsync({
        elementId: element.id,
        x: element.x || 0,
        y: element.y || 0,
        width: element.width || 100,
        height: element.height || 100,
        rotation: element.rotation || 0,
      });
    }

    setDragState({
      elementId: null,
      startX: 0,
      startY: 0,
      startWidth: 0,
      startHeight: 0,
      mode: null,
    });
  };

  const handleAddElement = async (type: string) => {
    if (!projectId) return;

    await createElement.mutateAsync({
      projectId: parseInt(projectId),
      elementType: type as any,
      layerIndex: elements.length,
      x: 50,
      y: 50,
      width: 200,
      height: 100,
      content: 'New Element',
    });

    // Refresh elements
    getElements.refetch();
  };

  const handleDeleteElement = async (elementId: number) => {
    await deleteElementMutation.mutateAsync({ elementId });
    setElements((prev) => prev.filter((el) => el.id !== elementId));
    setSelectedElement(null);
  };

  const handleDuplicateElement = async (elementId: number) => {
    await duplicateElementMutation.mutateAsync({ elementId });
    getElements.refetch();
  };

  const handleToggleVisibility = async (elementId: number) => {
    const element = elements.find((el) => el.id === elementId);
    if (!element) return;

    await updateVisibility.mutateAsync({
      elementId,
      visible: (element.visible || 0) === 0,
      locked: (element.locked || 0) === 1,
    });

    setElements((prev) =>
      prev.map((el) =>
        el.id === elementId ? { ...el, visible: (el.visible || 0) === 0 ? 1 : 0 } : el
      )
    );
  };

  const selectedElementData = selectedElement ? elements.find((el) => el.id === selectedElement) : null;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              محرر القوالب المرئي
            </span>
          </h1>
          <Button className="bg-cyan-600 hover:bg-cyan-700">حفظ</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Toolbar */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-slate-700 p-4">
              <h2 className="text-lg font-bold mb-4">أدوات الإضافة</h2>

              <div className="space-y-2">
                <Button
                  onClick={() => handleAddElement('text')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Type className="w-4 h-4 mr-2" />
                  نص
                </Button>
                <Button
                  onClick={() => handleAddElement('image')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Image className="w-4 h-4 mr-2" />
                  صورة
                </Button>
                <Button
                  onClick={() => handleAddElement('shape')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Square className="w-4 h-4 mr-2" />
                  شكل
                </Button>
                <Button
                  onClick={() => handleAddElement('video')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Video className="w-4 h-4 mr-2" />
                  فيديو
                </Button>
                <Button
                  onClick={() => handleAddElement('audio')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Music className="w-4 h-4 mr-2" />
                  صوت
                </Button>
              </div>

              {/* Layers Panel */}
              <div className="mt-6">
                <h3 className="text-sm font-bold mb-3">الطبقات</h3>
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {elements.map((element) => (
                    <div
                      key={element.id}
                      onClick={() => setSelectedElement(element.id)}
                      className={`p-2 rounded cursor-pointer transition-colors ${
                        selectedElement === element.id
                          ? 'bg-cyan-600'
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm truncate">
                          {element.elementType} #{element.id}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleVisibility(element.id);
                            }}
                            className="p-1 hover:bg-slate-500 rounded"
                          >
                            {(element.visible || 0) === 1 ? (
                              <Eye className="w-3 h-3" />
                            ) : (
                              <EyeOff className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Canvas */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700 p-4">
              <div
                ref={canvasRef}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                className="relative w-full h-96 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg overflow-hidden cursor-move"
              >
                {/* Canvas Elements */}
                {elements.map((element) => (
                  <div
                    key={element.id}
                    onClick={() => setSelectedElement(element.id)}
                    style={{
                      position: 'absolute',
                      left: `${element.x || 0}px`,
                      top: `${element.y || 0}px`,
                      width: `${element.width || 100}px`,
                      height: `${element.height || 100}px`,
                      opacity: (element.opacity || 100) / 100,
                      transform: `rotate(${element.rotation || 0}deg)`,
                      zIndex: element.zIndex || 0,
                      display: (element.visible || 0) === 0 ? 'none' : 'block',
                    }}
                    className={`bg-slate-700 border-2 rounded flex items-center justify-center text-white text-sm transition-colors ${
                      selectedElement === element.id
                        ? 'border-cyan-500 shadow-lg shadow-cyan-500/50'
                        : 'border-slate-600'
                    }`}
                  >
                    <span className="text-center px-2 truncate">
                      {element.content || element.elementType}
                    </span>

                    {/* Resize Handle */}
                    {selectedElement === element.id && (
                      <div
                        className="absolute bottom-0 right-0 w-3 h-3 bg-cyan-500 cursor-se-resize"
                        style={{
                          borderRadius: '0 0 4px 0',
                          pointerEvents: 'auto',
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Properties Panel */}
          <div className="lg:col-span-1">
            {selectedElementData ? (
              <CustomizationPanel
                elementId={selectedElement || 0}
                currentColor="#ffffff"
                currentFont="Arial"
                currentSize={16}
                currentOpacity={100}
                onColorChange={(color) => {
                  // Handle color change
                }}
                onFontChange={(font) => {
                  // Handle font change
                }}
                onSizeChange={(size) => {
                  // Handle size change
                }}
                onOpacityChange={(opacity) => {
                  setElements((prev) =>
                    prev.map((el) =>
                      el.id === selectedElement
                        ? { ...el, opacity }
                        : el
                    )
                  );
                }}
                onDelete={() => selectedElement && handleDeleteElement(selectedElement)}
              />
            ) : (
              <Card className="bg-slate-800/50 border-slate-700 p-4">
                <p className="text-slate-400 text-center py-8">
                  اختر عنصراً من القماش لتحريره
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
