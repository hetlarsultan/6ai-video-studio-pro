/**
 * Advanced Filters Component
 * نظام تصفية وفرز متقدم لمكتبة الوسائط
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Filter,
  X,
  Calendar,
  HardDrive,
  Zap,
  RotateCcw,
} from 'lucide-react';

export interface FilterOptions {
  types: ('video' | 'image' | 'audio')[];
  sortBy: 'recent' | 'oldest' | 'largest' | 'smallest' | 'popular';
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  sizeRange: {
    min: number;
    max: number;
  };
  quality?: 'all' | 'low' | 'medium' | 'high';
  hasAudio?: boolean;
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onReset?: () => void;
}

export default function AdvancedFilters({
  filters,
  onFiltersChange,
  onReset,
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);

  const handleTypeToggle = (type: 'video' | 'image' | 'audio') => {
    const newTypes = tempFilters.types.includes(type)
      ? tempFilters.types.filter((t) => t !== type)
      : [...tempFilters.types, type];

    const updated = { ...tempFilters, types: newTypes };
    setTempFilters(updated);
    onFiltersChange(updated);
  };

  const handleSortChange = (sortBy: FilterOptions['sortBy']) => {
    const updated = { ...tempFilters, sortBy };
    setTempFilters(updated);
    onFiltersChange(updated);
  };

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = {
      ...tempFilters,
      dateRange: {
        ...tempFilters.dateRange,
        from: e.target.value ? new Date(e.target.value) : null,
      },
    };
    setTempFilters(updated);
    onFiltersChange(updated);
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = {
      ...tempFilters,
      dateRange: {
        ...tempFilters.dateRange,
        to: e.target.value ? new Date(e.target.value) : null,
      },
    };
    setTempFilters(updated);
    onFiltersChange(updated);
  };

  const handleSizeRangeChange = (values: number[]) => {
    const updated = {
      ...tempFilters,
      sizeRange: {
        min: values[0],
        max: values[1],
      },
    };
    setTempFilters(updated);
    onFiltersChange(updated);
  };

  const handleQualityChange = (quality: FilterOptions['quality']) => {
    const updated = { ...tempFilters, quality };
    setTempFilters(updated);
    onFiltersChange(updated);
  };

  const handleAudioToggle = () => {
    const updated = { ...tempFilters, hasAudio: !tempFilters.hasAudio };
    setTempFilters(updated);
    onFiltersChange(updated);
  };

  const handleReset = () => {
    const defaultFilters: FilterOptions = {
      types: ['video', 'image', 'audio'],
      sortBy: 'recent',
      dateRange: { from: null, to: null },
      sizeRange: { min: 0, max: 1000 },
      quality: 'all',
      hasAudio: undefined,
    };
    setTempFilters(defaultFilters);
    onFiltersChange(defaultFilters);
    onReset?.();
  };

  const formatFileSize = (mb: number) => {
    if (mb < 1024) return `${mb} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
  };

  const activeFiltersCount = [
    filters.types.length !== 3 ? 1 : 0,
    filters.sortBy !== 'recent' ? 1 : 0,
    filters.dateRange.from || filters.dateRange.to ? 1 : 0,
    filters.sizeRange.min > 0 || filters.sizeRange.max < 1000 ? 1 : 0,
    filters.quality !== 'all' ? 1 : 0,
    filters.hasAudio !== undefined ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      {/* Quick Filters Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Type Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              النوع
              {filters.types.length !== 3 && (
                <span className="ml-1 text-xs bg-cyan-500 text-white px-2 py-0.5 rounded">
                  {filters.types.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-slate-800 border-slate-700">
            <DropdownMenuCheckboxItem
              checked={filters.types.includes('video')}
              onCheckedChange={() => handleTypeToggle('video')}
              className="cursor-pointer"
            >
              فيديو
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.types.includes('image')}
              onCheckedChange={() => handleTypeToggle('image')}
              className="cursor-pointer"
            >
              صور
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.types.includes('audio')}
              onCheckedChange={() => handleTypeToggle('audio')}
              className="cursor-pointer"
            >
              صوت
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Zap className="w-4 h-4" />
              الترتيب
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-slate-800 border-slate-700">
            <DropdownMenuItem
              onClick={() => handleSortChange('recent')}
              className={filters.sortBy === 'recent' ? 'bg-cyan-500/20' : ''}
            >
              الأحدث أولاً
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSortChange('oldest')}
              className={filters.sortBy === 'oldest' ? 'bg-cyan-500/20' : ''}
            >
              الأقدم أولاً
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem
              onClick={() => handleSortChange('largest')}
              className={filters.sortBy === 'largest' ? 'bg-cyan-500/20' : ''}
            >
              الأكبر حجماً
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSortChange('smallest')}
              className={filters.sortBy === 'smallest' ? 'bg-cyan-500/20' : ''}
            >
              الأصغر حجماً
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem
              onClick={() => handleSortChange('popular')}
              className={filters.sortBy === 'popular' ? 'bg-cyan-500/20' : ''}
            >
              الأكثر تنزيلاً
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Advanced Filters Toggle */}
        <Button
          variant={isExpanded ? 'default' : 'outline'}
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          متقدم
          {activeFiltersCount > 0 && (
            <span className="ml-1 text-xs bg-orange-500 text-white px-2 py-0.5 rounded">
              {activeFiltersCount}
            </span>
          )}
        </Button>

        {/* Reset Button */}
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-2 text-red-400 hover:text-red-300"
          >
            <RotateCcw className="w-4 h-4" />
            إعادة تعيين
          </Button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {isExpanded && (
        <Card className="p-6 bg-slate-800/50 border-slate-700 space-y-6">
          {/* Date Range Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <label className="font-semibold text-white">نطاق التاريخ</label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400">من</label>
                <Input
                  type="date"
                  value={
                    filters.dateRange.from
                      ? filters.dateRange.from.toISOString().split('T')[0]
                      : ''
                  }
                  onChange={handleDateFromChange}
                  className="mt-1 bg-slate-700 border-slate-600"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">إلى</label>
                <Input
                  type="date"
                  value={
                    filters.dateRange.to
                      ? filters.dateRange.to.toISOString().split('T')[0]
                      : ''
                  }
                  onChange={handleDateToChange}
                  className="mt-1 bg-slate-700 border-slate-600"
                />
              </div>
            </div>
          </div>

          {/* Size Range Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <label className="font-semibold text-white">نطاق الحجم</label>
            </div>
            <div className="space-y-2">
              <Slider
                value={[filters.sizeRange.min, filters.sizeRange.max]}
                min={0}
                max={1000}
                step={10}
                onValueChange={handleSizeRangeChange}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>{formatFileSize(filters.sizeRange.min)}</span>
                <span>{formatFileSize(filters.sizeRange.max)}</span>
              </div>
            </div>
          </div>

          {/* Quality Filter */}
          <div className="space-y-3">
            <label className="font-semibold text-white">الجودة</label>
            <div className="grid grid-cols-2 gap-2">
              {(['all', 'low', 'medium', 'high'] as const).map((quality) => (
                <Button
                  key={quality}
                  variant={filters.quality === quality ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleQualityChange(quality)}
                  className="text-xs"
                >
                  {quality === 'all'
                    ? 'الكل'
                    : quality === 'low'
                      ? 'منخفضة'
                      : quality === 'medium'
                        ? 'متوسطة'
                        : 'عالية'}
                </Button>
              ))}
            </div>
          </div>

          {/* Audio Filter */}
          <div className="space-y-3">
            <label className="font-semibold text-white">خيارات إضافية</label>
            <div className="flex items-center gap-3">
              <Button
                variant={filters.hasAudio ? 'default' : 'outline'}
                size="sm"
                onClick={handleAudioToggle}
                className="text-xs"
              >
                {filters.hasAudio === undefined
                  ? 'الكل'
                  : filters.hasAudio
                    ? 'مع صوت فقط'
                    : 'بدون صوت'}
              </Button>
              <span className="text-xs text-slate-400">
                {filters.hasAudio === undefined
                  ? 'عرض جميع الملفات'
                  : filters.hasAudio
                    ? 'عرض الملفات التي تحتوي على صوت'
                    : 'عرض الملفات بدون صوت'}
              </span>
            </div>
          </div>

          {/* Active Filters Summary */}
          {activeFiltersCount > 0 && (
            <div className="pt-4 border-t border-slate-700">
              <p className="text-xs text-slate-400 mb-2">الفلاتر النشطة:</p>
              <div className="flex flex-wrap gap-2">
                {filters.types.length !== 3 && (
                  <span className="inline-flex items-center gap-1 text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">
                    النوع: {filters.types.join(', ')}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() =>
                        onFiltersChange({
                          ...filters,
                          types: ['video', 'image', 'audio'],
                        })
                      }
                    />
                  </span>
                )}
                {filters.sortBy !== 'recent' && (
                  <span className="inline-flex items-center gap-1 text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">
                    الترتيب: {filters.sortBy}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() =>
                        onFiltersChange({ ...filters, sortBy: 'recent' })
                      }
                    />
                  </span>
                )}
                {(filters.dateRange.from || filters.dateRange.to) && (
                  <span className="inline-flex items-center gap-1 text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">
                    التاريخ: {filters.dateRange.from?.toLocaleDateString('ar-SA')} -{' '}
                    {filters.dateRange.to?.toLocaleDateString('ar-SA')}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() =>
                        onFiltersChange({
                          ...filters,
                          dateRange: { from: null, to: null },
                        })
                      }
                    />
                  </span>
                )}
                {(filters.sizeRange.min > 0 ||
                  filters.sizeRange.max < 1000) && (
                  <span className="inline-flex items-center gap-1 text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">
                    الحجم: {formatFileSize(filters.sizeRange.min)} -{' '}
                    {formatFileSize(filters.sizeRange.max)}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() =>
                        onFiltersChange({
                          ...filters,
                          sizeRange: { min: 0, max: 1000 },
                        })
                      }
                    />
                  </span>
                )}
                {filters.quality !== 'all' && (
                  <span className="inline-flex items-center gap-1 text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">
                    الجودة: {filters.quality}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() =>
                        onFiltersChange({ ...filters, quality: 'all' })
                      }
                    />
                  </span>
                )}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
