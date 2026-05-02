import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Settings,
  Eye,
  EyeOff,
} from 'lucide-react';

interface Animation {
  id: number;
  animationType: string;
  duration: number;
  delay: number;
  easing: string;
  iterations: number;
  enabled: number;
}

interface AnimationPanelProps {
  elementId: number;
  animations: Animation[];
  onAddAnimation: (type: string) => void;
  onDeleteAnimation: (animationId: number) => void;
  onUpdateAnimation: (animationId: number, data: any) => void;
  onPreview: () => void;
}

const animationTypes = [
  { name: 'Fade', value: 'fade', icon: '👁️' },
  { name: 'Slide', value: 'slide', icon: '➡️' },
  { name: 'Zoom', value: 'zoom', icon: '🔍' },
  { name: 'Rotate', value: 'rotate', icon: '🔄' },
  { name: 'Bounce', value: 'bounce', icon: '⬆️' },
  { name: 'Flip', value: 'flip', icon: '🔀' },
  { name: 'Swing', value: 'swing', icon: '🎪' },
  { name: 'Pulse', value: 'pulse', icon: '💓' },
  { name: 'Shake', value: 'shake', icon: '📳' },
  { name: 'Heartbeat', value: 'heartbeat', icon: '❤️' },
];

const easingOptions = [
  { name: 'Linear', value: 'linear' },
  { name: 'Ease In', value: 'ease-in' },
  { name: 'Ease Out', value: 'ease-out' },
  { name: 'Ease In-Out', value: 'ease-in-out' },
];

/**
 * Animation Panel Component
 * Manages animations and transitions for elements
 */
export default function AnimationPanel({
  elementId,
  animations,
  onAddAnimation,
  onDeleteAnimation,
  onUpdateAnimation,
  onPreview,
}: AnimationPanelProps) {
  const [selectedAnimationId, setSelectedAnimationId] = useState<number | null>(null);
  const [showPresets, setShowPresets] = useState(false);

  const selectedAnimation = animations.find((a) => a.id === selectedAnimationId);

  return (
    <Card className="bg-slate-800/50 border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          التأثيرات والحركات
        </h3>
        <Button
          onClick={onPreview}
          size="sm"
          className="bg-cyan-600 hover:bg-cyan-700"
        >
          <Play className="w-4 h-4 mr-1" />
          معاينة
        </Button>
      </div>

      {/* Animation List */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-2 text-slate-300">الحركات المطبقة</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {animations.length === 0 ? (
            <p className="text-sm text-slate-400 py-2">لا توجد حركات مطبقة</p>
          ) : (
            animations.map((animation) => (
              <div
                key={animation.id}
                onClick={() => setSelectedAnimationId(animation.id)}
                className={`p-2 rounded cursor-pointer transition-colors flex items-center justify-between ${
                  selectedAnimationId === animation.id
                    ? 'bg-cyan-600'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {animationTypes.find((t) => t.value === animation.animationType)?.name ||
                      animation.animationType}
                  </p>
                  <p className="text-xs text-slate-400">
                    {animation.duration}ms • {animation.easing}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateAnimation(animation.id, {
                        enabled: animation.enabled === 1 ? 0 : 1,
                      });
                    }}
                    className="p-1 hover:bg-slate-500 rounded"
                  >
                    {animation.enabled === 1 ? (
                      <Eye className="w-3 h-3" />
                    ) : (
                      <EyeOff className="w-3 h-3" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteAnimation(animation.id);
                    }}
                    className="p-1 hover:bg-red-900/50 rounded text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Animation */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-2 text-slate-300">إضافة حركة</h4>
        <div className="grid grid-cols-5 gap-2">
          {animationTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => onAddAnimation(type.value)}
              className="p-2 rounded bg-slate-700 hover:bg-slate-600 transition-colors text-center text-xs"
              title={type.name}
            >
              <div className="text-lg mb-1">{type.icon}</div>
              <div className="text-xs text-slate-300">{type.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Animation Settings */}
      {selectedAnimation && (
        <div className="border-t border-slate-700 pt-4">
          <h4 className="text-sm font-semibold mb-3 text-slate-300">إعدادات الحركة</h4>

          {/* Duration */}
          <div className="mb-3">
            <label className="text-xs text-slate-400 block mb-1">
              المدة: {selectedAnimation.duration}ms
            </label>
            <input
              type="range"
              min="100"
              max="5000"
              step="100"
              value={selectedAnimation.duration}
              onChange={(e) =>
                onUpdateAnimation(selectedAnimation.id, {
                  duration: parseInt(e.target.value),
                })
              }
              className="w-full"
            />
          </div>

          {/* Delay */}
          <div className="mb-3">
            <label className="text-xs text-slate-400 block mb-1">
              التأخير: {selectedAnimation.delay}ms
            </label>
            <input
              type="range"
              min="0"
              max="2000"
              step="100"
              value={selectedAnimation.delay}
              onChange={(e) =>
                onUpdateAnimation(selectedAnimation.id, {
                  delay: parseInt(e.target.value),
                })
              }
              className="w-full"
            />
          </div>

          {/* Easing */}
          <div className="mb-3">
            <label className="text-xs text-slate-400 block mb-1">نوع التسارع</label>
            <select
              value={selectedAnimation.easing}
              onChange={(e) =>
                onUpdateAnimation(selectedAnimation.id, {
                  easing: e.target.value,
                })
              }
              className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
            >
              {easingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>

          {/* Iterations */}
          <div className="mb-3">
            <label className="text-xs text-slate-400 block mb-1">
              التكرارات: {selectedAnimation.iterations === -1 ? 'لانهائي' : selectedAnimation.iterations}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={selectedAnimation.iterations === -1 ? 10 : selectedAnimation.iterations}
              onChange={(e) =>
                onUpdateAnimation(selectedAnimation.id, {
                  iterations: parseInt(e.target.value),
                })
              }
              className="w-full"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() =>
                  onUpdateAnimation(selectedAnimation.id, {
                    iterations: -1,
                  })
                }
                className={`text-xs px-2 py-1 rounded ${
                  selectedAnimation.iterations === -1
                    ? 'bg-cyan-600'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                لانهائي
              </button>
            </div>
          </div>

          {/* Preview Button */}
          <Button
            onClick={onPreview}
            variant="outline"
            className="w-full mt-3"
          >
            <Play className="w-4 h-4 mr-2" />
            معاينة الحركة
          </Button>
        </div>
      )}

      {/* Presets */}
      <div className="border-t border-slate-700 pt-4 mt-4">
        <button
          onClick={() => setShowPresets(!showPresets)}
          className="w-full text-left text-sm font-semibold text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          القوالب المسبقة
        </button>

        {showPresets && (
          <div className="mt-2 space-y-2">
            <button className="w-full text-left px-2 py-1 text-sm rounded bg-slate-700 hover:bg-slate-600 transition-colors">
              ✨ دخول درامي
            </button>
            <button className="w-full text-left px-2 py-1 text-sm rounded bg-slate-700 hover:bg-slate-600 transition-colors">
              🎬 انتقال سلس
            </button>
            <button className="w-full text-left px-2 py-1 text-sm rounded bg-slate-700 hover:bg-slate-600 transition-colors">
              🎉 احتفالي
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
