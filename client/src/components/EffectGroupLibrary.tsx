import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Sparkles,
  Grid3x3,
  List,
  Search,
  Filter,
  Play,
  Plus,
} from 'lucide-react';

interface EffectGroup {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  category: 'entrance' | 'exit' | 'emphasis' | 'custom';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  tags: string[];
}

interface EffectGroupLibraryProps {
  onApplyEffect: (effectId: string) => void;
  selectedElements: number[];
}

const categoryLabels = {
  entrance: { en: 'Entrance', ar: 'الدخول' },
  exit: { en: 'Exit', ar: 'الخروج' },
  emphasis: { en: 'Emphasis', ar: 'التركيز' },
  custom: { en: 'Custom', ar: 'مخصص' },
};

const difficultyColors = {
  easy: 'bg-green-900/50 text-green-300',
  medium: 'bg-yellow-900/50 text-yellow-300',
  hard: 'bg-red-900/50 text-red-300',
};

/**
 * Effect Group Library Component
 * Display and apply pre-built effect groups
 */
export default function EffectGroupLibrary({
  onApplyEffect,
  selectedElements,
}: EffectGroupLibraryProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [previewEffect, setPreviewEffect] = useState<string | null>(null);

  // Mock data - في التطبيق الحقيقي ستأتي من API
  const mockEffects: EffectGroup[] = [
    {
      id: 'fade-in',
      name: 'Fade In',
      nameAr: 'تلاشي الدخول',
      icon: '👁️',
      category: 'entrance',
      difficulty: 'easy',
      duration: 1000,
      tags: ['smooth', 'subtle'],
    },
    {
      id: 'slide-in-left',
      name: 'Slide In Left',
      nameAr: 'انزلاق من اليسار',
      icon: '➡️',
      category: 'entrance',
      difficulty: 'easy',
      duration: 800,
      tags: ['dynamic', 'modern'],
    },
    {
      id: 'zoom-in',
      name: 'Zoom In',
      nameAr: 'تكبير الدخول',
      icon: '🔍',
      category: 'entrance',
      difficulty: 'easy',
      duration: 600,
      tags: ['attention', 'dramatic'],
    },
    {
      id: 'bounce-in',
      name: 'Bounce In',
      nameAr: 'ارتداد الدخول',
      icon: '⬆️',
      category: 'entrance',
      difficulty: 'medium',
      duration: 1200,
      tags: ['energetic', 'fun'],
    },
    {
      id: 'fade-out',
      name: 'Fade Out',
      nameAr: 'تلاشي الخروج',
      icon: '👁️',
      category: 'exit',
      difficulty: 'easy',
      duration: 1000,
      tags: ['smooth', 'subtle'],
    },
    {
      id: 'pulse',
      name: 'Pulse',
      nameAr: 'نبض',
      icon: '💓',
      category: 'emphasis',
      difficulty: 'easy',
      duration: 1000,
      tags: ['attention', 'subtle'],
    },
    {
      id: 'shake',
      name: 'Shake',
      nameAr: 'اهتزاز',
      icon: '📳',
      category: 'emphasis',
      difficulty: 'easy',
      duration: 600,
      tags: ['attention', 'energetic'],
    },
    {
      id: 'dramatic-entrance',
      name: 'Dramatic Entrance',
      nameAr: 'دخول درامي',
      icon: '🎬',
      category: 'custom',
      difficulty: 'hard',
      duration: 1500,
      tags: ['dramatic', 'professional'],
    },
  ];

  // Filter effects
  const filteredEffects = mockEffects.filter((effect) => {
    const matchesCategory =
      selectedCategory === 'all' || effect.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === 'all' || effect.difficulty === selectedDifficulty;
    const matchesSearch =
      effect.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      effect.nameAr.includes(searchQuery);

    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          مكتبة التأثيرات
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${
              viewMode === 'grid'
                ? 'bg-cyan-600'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${
              viewMode === 'list'
                ? 'bg-cyan-600'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ابحث عن التأثيرات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded text-sm ${
              selectedCategory === 'all'
                ? 'bg-cyan-600'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            الكل
          </button>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-1 rounded text-sm ${
                selectedCategory === key
                  ? 'bg-cyan-600'
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              {label.ar}
            </button>
          ))}
        </div>

        {/* Difficulty Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedDifficulty('all')}
            className={`px-3 py-1 rounded text-sm ${
              selectedDifficulty === 'all'
                ? 'bg-cyan-600'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            جميع المستويات
          </button>
          <button
            onClick={() => setSelectedDifficulty('easy')}
            className={`px-3 py-1 rounded text-sm ${
              selectedDifficulty === 'easy'
                ? 'bg-green-600'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            سهل
          </button>
          <button
            onClick={() => setSelectedDifficulty('medium')}
            className={`px-3 py-1 rounded text-sm ${
              selectedDifficulty === 'medium'
                ? 'bg-yellow-600'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            متوسط
          </button>
          <button
            onClick={() => setSelectedDifficulty('hard')}
            className={`px-3 py-1 rounded text-sm ${
              selectedDifficulty === 'hard'
                ? 'bg-red-600'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            متقدم
          </button>
        </div>
      </div>

      {/* Effects Display */}
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'
            : 'space-y-2'
        }
      >
        {filteredEffects.length === 0 ? (
          <div className="col-span-full text-center py-8 text-slate-400">
            لم يتم العثور على تأثيرات
          </div>
        ) : (
          filteredEffects.map((effect) => (
            <Card
              key={effect.id}
              className={`bg-slate-800/50 border-slate-700 p-3 cursor-pointer transition-all hover:border-cyan-500 ${
                previewEffect === effect.id ? 'border-cyan-500' : ''
              }`}
              onClick={() => setPreviewEffect(effect.id)}
            >
              <div className="space-y-2">
                {/* Icon and Name */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-2xl mb-1">{effect.icon}</div>
                    <h4 className="font-semibold text-sm">{effect.nameAr}</h4>
                    <p className="text-xs text-slate-400">{effect.name}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      difficultyColors[effect.difficulty]
                    }`}
                  >
                    {effect.difficulty === 'easy'
                      ? 'سهل'
                      : effect.difficulty === 'medium'
                        ? 'متوسط'
                        : 'متقدم'}
                  </span>
                </div>

                {/* Duration */}
                <div className="text-xs text-slate-400">
                  المدة: {effect.duration}ms
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {effect.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-slate-700 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewEffect(effect.id);
                    }}
                    className="flex-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs flex items-center justify-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    معاينة
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (selectedElements.length > 0) {
                        onApplyEffect(effect.id);
                      }
                    }}
                    disabled={selectedElements.length === 0}
                    className="flex-1 px-2 py-1 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    تطبيق
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Info Message */}
      {selectedElements.length === 0 && (
        <div className="bg-blue-900/30 border border-blue-700 rounded p-3 text-sm text-blue-300">
          اختر عنصراً من الصفحة لتطبيق التأثيرات عليه
        </div>
      )}

      {/* Statistics */}
      <div className="bg-slate-800/50 border border-slate-700 rounded p-3 text-xs text-slate-400">
        <div className="flex justify-between">
          <span>إجمالي التأثيرات: {filteredEffects.length}</span>
          <span>المعروضة: {filteredEffects.length}</span>
        </div>
      </div>
    </div>
  );
}
