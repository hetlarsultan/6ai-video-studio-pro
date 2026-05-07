import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Layers,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface Layer {
  id: number;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  type: 'video' | 'image' | 'text' | 'audio';
  order: number;
}

interface LayerManagerProps {
  layers?: Layer[];
  selectedLayerId?: number;
  onSelectLayer?: (layerId: number) => void;
  onAddLayer?: (type: 'video' | 'image' | 'text' | 'audio') => Promise<void>;
  onDeleteLayer?: (layerId: number) => Promise<void>;
  onToggleVisibility?: (layerId: number) => Promise<void>;
  onToggleLock?: (layerId: number) => Promise<void>;
  onReorderLayer?: (layerId: number, direction: 'up' | 'down') => Promise<void>;
  onUpdateLayerName?: (layerId: number, name: string) => Promise<void>;
  onUpdateOpacity?: (layerId: number, opacity: number) => Promise<void>;
}

const LAYER_TYPE_ICONS: Record<string, string> = {
  video: '🎬',
  image: '🖼️',
  text: '📝',
  audio: '🔊',
};

const LAYER_TYPE_LABELS: Record<string, string> = {
  video: 'فيديو',
  image: 'صورة',
  text: 'نص',
  audio: 'صوت',
};

export default function LayerManager({
  layers = [],
  selectedLayerId,
  onSelectLayer,
  onAddLayer,
  onDeleteLayer,
  onToggleVisibility,
  onToggleLock,
  onReorderLayer,
  onUpdateLayerName,
  onUpdateOpacity,
}: LayerManagerProps) {
  const [isAddingLayer, setIsAddingLayer] = useState(false);
  const [editingLayerId, setEditingLayerId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleAddLayer = async (type: 'video' | 'image' | 'text' | 'audio') => {
    setIsAddingLayer(true);
    try {
      if (onAddLayer) {
        await onAddLayer(type);
      }
      toast.success(`تم إضافة طبقة ${LAYER_TYPE_LABELS[type]} بنجاح ✅`);
    } catch (error) {
      toast.error('فشل في إضافة الطبقة');
      console.error(error);
    } finally {
      setIsAddingLayer(false);
    }
  };

  const handleDeleteLayer = async (layerId: number) => {
    setLoadingId(layerId);
    try {
      if (onDeleteLayer) {
        await onDeleteLayer(layerId);
      }
      toast.success('تم حذف الطبقة بنجاح ✅');
    } catch (error) {
      toast.error('فشل في حذف الطبقة');
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggleVisibility = async (layerId: number) => {
    setLoadingId(layerId);
    try {
      if (onToggleVisibility) {
        await onToggleVisibility(layerId);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggleLock = async (layerId: number) => {
    setLoadingId(layerId);
    try {
      if (onToggleLock) {
        await onToggleLock(layerId);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleReorderLayer = async (layerId: number, direction: 'up' | 'down') => {
    setLoadingId(layerId);
    try {
      if (onReorderLayer) {
        await onReorderLayer(layerId, direction);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleUpdateLayerName = async (layerId: number) => {
    if (!editingName.trim()) {
      setEditingLayerId(null);
      return;
    }

    setLoadingId(layerId);
    try {
      if (onUpdateLayerName) {
        await onUpdateLayerName(layerId, editingName);
      }
      toast.success('تم تحديث اسم الطبقة بنجاح ✅');
      setEditingLayerId(null);
    } catch (error) {
      toast.error('فشل في تحديث اسم الطبقة');
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleUpdateOpacity = async (layerId: number, opacity: number) => {
    setLoadingId(layerId);
    try {
      if (onUpdateOpacity) {
        await onUpdateOpacity(layerId, opacity);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  };

  const sortedLayers = [...layers].sort((a, b) => b.order - a.order);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-4 border-b border-slate-700">
        <Layers className="w-5 h-5 text-cyan-400" />
        <h3 className="font-semibold text-slate-200">الطبقات</h3>
        <span className="ml-auto text-sm text-slate-400">{layers.length} طبقة</span>
      </div>

      {/* Add Layer Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {(['video', 'image', 'text', 'audio'] as const).map((type) => (
          <Button
            key={type}
            onClick={() => handleAddLayer(type)}
            disabled={isAddingLayer}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            {isAddingLayer ? (
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
            ) : (
              <Plus className="w-3 h-3 mr-1" />
            )}
            {LAYER_TYPE_LABELS[type]}
          </Button>
        ))}
      </div>

      {/* Layers List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {layers.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>لا توجد طبقات حتى الآن</p>
          </div>
        ) : (
          sortedLayers.map((layer) => (
            <Card
              key={layer.id}
              onClick={() => onSelectLayer?.(layer.id)}
              className={`p-3 cursor-pointer transition-all ${
                selectedLayerId === layer.id
                  ? 'bg-cyan-600/20 border-cyan-500'
                  : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
              }`}
            >
              <div className="space-y-2">
                {/* Layer Header */}
                <div className="flex items-center gap-2">
                  <span className="text-lg">{LAYER_TYPE_ICONS[layer.type]}</span>
                  {editingLayerId === layer.id ? (
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => handleUpdateLayerName(layer.id)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdateLayerName(layer.id);
                        }
                      }}
                      autoFocus
                      className="flex-1 bg-slate-600 border-slate-500 text-sm h-7"
                    />
                  ) : (
                    <p
                      onDoubleClick={() => {
                        setEditingLayerId(layer.id);
                        setEditingName(layer.name);
                      }}
                      className="flex-1 text-sm font-medium text-slate-200 cursor-pointer hover:text-cyan-400"
                    >
                      {layer.name}
                    </p>
                  )}
                  <div className="flex gap-1">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleVisibility(layer.id);
                      }}
                      disabled={loadingId === layer.id}
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-slate-400 hover:text-cyan-400"
                    >
                      {loadingId === layer.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : layer.visible ? (
                        <Eye className="w-3 h-3" />
                      ) : (
                        <EyeOff className="w-3 h-3" />
                      )}
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLock(layer.id);
                      }}
                      disabled={loadingId === layer.id}
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-slate-400 hover:text-cyan-400"
                    >
                      {layer.locked ? (
                        <Lock className="w-3 h-3" />
                      ) : (
                        <Unlock className="w-3 h-3" />
                      )}
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLayer(layer.id);
                      }}
                      disabled={loadingId === layer.id}
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-950/20"
                    >
                      {loadingId === layer.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Opacity Slider */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">الشفافية:</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={layer.opacity}
                    onChange={(e) => handleUpdateOpacity(layer.id, parseInt(e.target.value))}
                    className="flex-1 h-1"
                  />
                  <span className="text-xs text-slate-400 w-8 text-right">{layer.opacity}%</span>
                </div>

                {/* Reorder Buttons */}
                <div className="flex gap-1">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReorderLayer(layer.id, 'up');
                    }}
                    disabled={loadingId === layer.id || layer.order === sortedLayers[0].order}
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-slate-400 hover:text-cyan-400"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReorderLayer(layer.id, 'down');
                    }}
                    disabled={
                      loadingId === layer.id ||
                      layer.order === sortedLayers[sortedLayers.length - 1].order
                    }
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-slate-400 hover:text-cyan-400"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
