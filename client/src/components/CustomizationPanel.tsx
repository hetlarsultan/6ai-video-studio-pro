import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Palette,
  Type,
  Maximize2,
  Layers,
  Zap,
  Trash2,
} from 'lucide-react';

interface CustomizationPanelProps {
  elementId: number;
  onColorChange: (color: string) => void;
  onFontChange: (font: string) => void;
  onSizeChange: (size: number) => void;
  onOpacityChange: (opacity: number) => void;
  onDelete: () => void;
  currentColor?: string;
  currentFont?: string;
  currentSize?: number;
  currentOpacity?: number;
}

/**
 * Customization Panel for Elements
 * Provides color, font, size, and opacity controls
 */
export default function CustomizationPanel({
  elementId,
  onColorChange,
  onFontChange,
  onSizeChange,
  onOpacityChange,
  onDelete,
  currentColor = '#ffffff',
  currentFont = 'Arial',
  currentSize = 16,
  currentOpacity = 100,
}: CustomizationPanelProps) {
  const [activeTab, setActiveTab] = useState<'color' | 'font' | 'size' | 'effects'>('color');

  const colors = [
    '#ffffff',
    '#000000',
    '#ff0000',
    '#00ff00',
    '#0000ff',
    '#ffff00',
    '#ff00ff',
    '#00ffff',
    '#ff6b6b',
    '#4ecdc4',
    '#45b7d1',
    '#96ceb4',
  ];

  const fonts = [
    'Arial',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Verdana',
    'Comic Sans MS',
    'Impact',
    'Trebuchet MS',
  ];

  const sizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

  return (
    <Card className="bg-slate-800/50 border-slate-700 p-4">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <Palette className="w-5 h-5" />
        التخصيص
      </h3>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('color')}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === 'color'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Palette className="w-4 h-4 inline mr-1" />
          اللون
        </button>
        <button
          onClick={() => setActiveTab('font')}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === 'font'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Type className="w-4 h-4 inline mr-1" />
          الخط
        </button>
        <button
          onClick={() => setActiveTab('size')}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === 'size'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Maximize2 className="w-4 h-4 inline mr-1" />
          الحجم
        </button>
        <button
          onClick={() => setActiveTab('effects')}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === 'effects'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-4 h-4 inline mr-1" />
          التأثيرات
        </button>
      </div>

      {/* Color Tab */}
      {activeTab === 'color' && (
        <div className="space-y-3">
          <div>
            <label className="text-sm text-slate-400 block mb-2">اختر لوناً</label>
            <div className="grid grid-cols-6 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => onColorChange(color)}
                  className={`w-8 h-8 rounded border-2 transition-all ${
                    currentColor === color
                      ? 'border-cyan-400 shadow-lg'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 block mb-2">لون مخصص</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={currentColor}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={currentColor}
                onChange={(e) => onColorChange(e.target.value)}
                className="flex-1 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                placeholder="#ffffff"
              />
            </div>
          </div>
        </div>
      )}

      {/* Font Tab */}
      {activeTab === 'font' && (
        <div className="space-y-3">
          <label className="text-sm text-slate-400 block">اختر الخط</label>
          <select
            value={currentFont}
            onChange={(e) => onFontChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
          >
            {fonts.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>

          <div className="p-3 bg-slate-700/50 rounded border border-slate-600">
            <p style={{ fontFamily: currentFont }} className="text-sm">
              معاينة النص بالخط المختار
            </p>
          </div>
        </div>
      )}

      {/* Size Tab */}
      {activeTab === 'size' && (
        <div className="space-y-3">
          <div>
            <label className="text-sm text-slate-400 block mb-2">
              حجم الخط: {currentSize}px
            </label>
            <input
              type="range"
              min="8"
              max="72"
              value={currentSize}
              onChange={(e) => onSizeChange(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => onSizeChange(size)}
                className={`px-2 py-1 rounded text-sm transition-colors ${
                  currentSize === size
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Effects Tab */}
      {activeTab === 'effects' && (
        <div className="space-y-3">
          <div>
            <label className="text-sm text-slate-400 block mb-2">
              الشفافية: {currentOpacity}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={currentOpacity}
              onChange={(e) => onOpacityChange(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="p-3 bg-slate-700/50 rounded border border-slate-600">
            <div
              className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded"
              style={{ opacity: currentOpacity / 100 }}
            />
          </div>

          <div className="grid grid-cols-4 gap-2 mt-3">
            {[0, 25, 50, 75, 100].map((opacity) => (
              <button
                key={opacity}
                onClick={() => onOpacityChange(opacity)}
                className={`px-2 py-1 rounded text-sm transition-colors ${
                  currentOpacity === opacity
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {opacity}%
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Delete Button */}
      <div className="mt-6 pt-4 border-t border-slate-700">
        <Button
          onClick={onDelete}
          variant="outline"
          className="w-full text-red-400 hover:bg-red-900/20"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          حذف العنصر
        </Button>
      </div>
    </Card>
  );
}
