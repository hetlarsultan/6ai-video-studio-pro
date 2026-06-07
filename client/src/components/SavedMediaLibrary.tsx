/**
 * Saved Media Library Component
 * عرض وإدارة الملفات المحفوظة (فيديو/صور/صوت)
 */

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SavedFiltersPanel from './SavedFiltersPanel';
import { useFilterPreferences } from '@/hooks/useFilterPreferences';
import {
  Download,
  Trash2,
  Share2,
  Eye,
  Star,
  Search,
  Filter,
  Grid,
  List as ListIcon,
  Clock,
  Play,
  Image as ImageIcon,
  Music,
  Check,
  HardDrive,
} from 'lucide-react';
import { toast } from 'sonner';
import MediaPreviewModal from './MediaPreviewModal';
import AdvancedFilters, { FilterOptions } from './AdvancedFilters';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MediaFile {
  id: number;
  title: string;
  type: 'video' | 'image' | 'audio';
  format: string;
  url: string;
  size: number;
  duration?: number;
  thumbnail?: string;
  createdAt: Date;
  downloadCount?: number;
  isStarred?: boolean;
}

interface SavedMediaLibraryProps {
  projectId?: number;
}

export default function SavedMediaLibrary({ projectId }: SavedMediaLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterOptions>({
    types: ['video', 'image', 'audio'],
    sortBy: 'recent',
    dateRange: { from: null, to: null },
    sizeRange: { min: 0, max: 1000 },
    quality: 'all',
    hasAudio: undefined,
  });

  // بيانات تجريبية
  const mockFiles: MediaFile[] = [
    {
      id: 1,
      title: 'فيديو الترحيب',
      type: 'video',
      format: 'mp4',
      url: 'https://example.com/video1.mp4',
      size: 52428800,
      duration: 30,
      thumbnail: 'https://via.placeholder.com/300x200?text=Video+1',
      createdAt: new Date('2026-06-04'),
      downloadCount: 5,
      isStarred: true,
    },
    {
      id: 2,
      title: 'صورة المنتج',
      type: 'image',
      format: 'png',
      url: 'https://example.com/image1.png',
      size: 2097152,
      thumbnail: 'https://via.placeholder.com/300x200?text=Image+1',
      createdAt: new Date('2026-06-03'),
      downloadCount: 12,
      isStarred: false,
    },
    {
      id: 3,
      title: 'موسيقى الخلفية',
      type: 'audio',
      format: 'mp3',
      url: 'https://example.com/audio1.mp3',
      size: 5242880,
      duration: 120,
      createdAt: new Date('2026-06-02'),
      downloadCount: 3,
      isStarred: true,
    },
    {
      id: 4,
      title: 'فيديو العرض التوضيحي',
      type: 'video',
      format: 'webm',
      url: 'https://example.com/video2.webm',
      size: 104857600,
      duration: 60,
      thumbnail: 'https://via.placeholder.com/300x200?text=Video+2',
      createdAt: new Date('2026-06-01'),
      downloadCount: 8,
      isStarred: false,
    },
  ];

  // تصفية الملفات
  const filteredFiles = useMemo(() => {
    let result = mockFiles;

    // البحث
    if (searchQuery) {
      result = result.filter((f) =>
        f.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // النوع
    if (filters.types.length > 0 && filters.types.length < 3) {
      result = result.filter((f) => filters.types.includes(f.type as any));
    }

    // نطاق التاريخ
    if (filters.dateRange.from || filters.dateRange.to) {
      result = result.filter((f) => {
        const fileDate = new Date(f.createdAt);
        if (filters.dateRange.from && fileDate < filters.dateRange.from)
          return false;
        if (filters.dateRange.to && fileDate > filters.dateRange.to)
          return false;
        return true;
      });
    }

    // نطاق الحجم
    result = result.filter(
      (f) =>
        f.size >= filters.sizeRange.min * 1024 * 1024 &&
        f.size <= filters.sizeRange.max * 1024 * 1024
    );

    // الترتيب
    if (filters.sortBy === 'popular') {
      result = result.sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0));
    } else if (filters.sortBy === 'largest') {
      result = result.sort((a, b) => b.size - a.size);
    } else if (filters.sortBy === 'smallest') {
      result = result.sort((a, b) => a.size - b.size);
    } else if (filters.sortBy === 'oldest') {
      result = result.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } else {
      result = result.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return result;
  }, [searchQuery, filters]);

  // التحديد المتعدد للملفات
  const toggleFileSelection = (fileId: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map((f) => f.id.toString())));
    }
  };

  const getTotalSize = () => {
    let total = 0;
    selectedFiles.forEach((id) => {
      const file = mockFiles.find((f) => f.id.toString() === id);
      if (file) total += file.size;
    });
    return total;
  };

  const handleBatchDownload = () => {
    if (selectedFiles.size === 0) {
      toast.error('يرجى تحديد ملفات للتنزيل');
      return;
    }

    selectedFiles.forEach((id) => {
      const file = mockFiles.find((f) => f.id.toString() === id);
      if (file) {
        handleDownload(file);
      }
    });

    toast.success(`تم تنزيل ${selectedFiles.size} ملفات`);
    setSelectedFiles(new Set());
  };

  const handleBatchDelete = () => {
    if (selectedFiles.size === 0) {
      toast.error('يرجى تحديد ملفات للحذف');
      return;
    }

    toast.success(`تم حذف ${selectedFiles.size} ملفات`);
    setSelectedFiles(new Set());
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = (file: MediaFile) => {
    toast.success(`تم تنزيل ${file.title} ✅`);
    // في التطبيق الفعلي، سيتم تنزيل الملف من الرابط
    const link = document.createElement('a');
    link.href = file.url;
    link.download = `${file.title}.${file.format}`;
    link.click();
  };

  const handleDelete = (file: MediaFile) => {
    toast.success(`تم حذف ${file.title} ✅`);
    // في التطبيق الفعلي، سيتم حذف الملف من قاعدة البيانات
  };

  const handleShare = (file: MediaFile) => {
    toast.success(`تم نسخ رابط المشاركة ✅`);
    // في التطبيق الفعلي، سيتم نسخ الرابط إلى الحافظة
    navigator.clipboard.writeText(file.url);
  };

  const handlePreview = (file: MediaFile) => {
    setSelectedFile(file);
    setIsPreviewOpen(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="w-4 h-4" />;
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      case 'audio':
        return <Music className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'video':
        return 'فيديو';
      case 'image':
        return 'صورة';
      case 'audio':
        return 'صوت';
      default:
        return '';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Advanced Filters */}
      <AdvancedFilters
        filters={filters}
        onFiltersChange={setFilters}
        onReset={() =>
          setFilters({
            types: ['video', 'image', 'audio'],
            sortBy: 'recent',
            dateRange: { from: null, to: null },
            sizeRange: { min: 0, max: 1000 },
            quality: 'all',
            hasAudio: undefined,
          })
        }
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-cyan-400">مكتبة الملفات المحفوظة</h2>
          <p className="text-sm text-slate-400 mt-1">
            {filteredFiles.length} ملف محفوظ
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="البحث عن الملفات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700"
            />
          </div>
          {selectedFiles.size > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <span className="text-sm text-cyan-400">
                تم تحديد {selectedFiles.size} ملف ({formatFileSize(getTotalSize())})
              </span>
              <Button
                size="sm"
                onClick={handleBatchDownload}
                className="bg-cyan-500 hover:bg-cyan-600 gap-1"
              >
                <Download className="w-4 h-4" />
                تنزيل
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleBatchDelete}
                className="text-red-400 hover:text-red-300 gap-1"
              >
                <Trash2 className="w-4 h-4" />
                حذف
              </Button>
            </div>
          )}
          <Button
            variant={selectedFiles.size === filteredFiles.length && filteredFiles.length > 0 ? 'default' : 'outline'}
            size="icon"
            onClick={toggleSelectAll}
            title={selectedFiles.size === filteredFiles.length ? 'إلغاء التحديد' : 'تحديد الكل'}
          >
            <Check className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <ListIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Tabs and Sort */}
        <div className="flex items-center justify-between">
          <Tabs value={filters.types[0]} onValueChange={(v: any) => setFilters(v)}>
            <TabsList className="bg-slate-800/50">
              <TabsTrigger value="all">الكل</TabsTrigger>
              <TabsTrigger value="video">فيديو</TabsTrigger>
              <TabsTrigger value="image">صور</TabsTrigger>
              <TabsTrigger value="audio">صوت</TabsTrigger>
            </TabsList>
          </Tabs>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                الترتيب
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
              <DropdownMenuItem
                onClick={() => setFilters({ ...filters, sortBy: 'recent' })}
                className={filters.sortBy === 'recent' ? 'bg-cyan-500/20' : ''}
              >
                الأحدث أولاً
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilters({ ...filters, sortBy: 'popular' })}
                className={filters.sortBy === 'popular' ? 'bg-cyan-500/20' : ''}
              >
                الأكثر تنزيلاً
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilters({ ...filters, sortBy: 'largest' })}
                className={filters.sortBy === 'largest' ? 'bg-cyan-500/20' : ''}
              >
                الأكبر حجماً
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Files Display */}
      <div>
        {filteredFiles.length === 0 ? (
          <Card className="p-12 bg-slate-800/50 border-slate-700 text-center">
            <p className="text-slate-400">لا توجد ملفات محفوظة</p>
          </Card>
        ) : viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFiles.map((file) => {
              const isSelected = selectedFiles.has(file.id.toString());
              return (
              <Card
                key={file.id}
                className="bg-slate-800/50 border-slate-700 overflow-hidden hover:border-cyan-500/50 transition-all"
              >
                {/* Thumbnail */}
                {file.thumbnail && (
                  <div className="relative h-40 bg-slate-900 overflow-hidden group">
                    <img
                      src={file.thumbnail}
                      alt={file.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <button
                      onClick={() => handlePreview(file)}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Eye className="w-8 h-8 text-cyan-400" />
                    </button>
                  </div>
                )}

                {/* Content */}
                <div className="p-4 space-y-3">
                  {/* Title and Type */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{file.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">
                          {getTypeIcon(file.type)}
                          {getTypeLabel(file.type)}
                        </span>
                        <span className="text-xs text-slate-500">.{file.format}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0"
                      onClick={() => toast.info('تم إضافة إلى المفضلة')}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          file.isStarred
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-slate-500'
                        }`}
                      />
                    </Button>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-3 h-3" />
                      {formatFileSize(file.size)}
                    </div>
                    {file.duration && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {formatDuration(file.duration)}
                      </div>
                    )}
                    <div className="text-slate-500">
                      {new Date(file.createdAt).toLocaleDateString('ar-SA')}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1"
                      onClick={() => handleDownload(file)}
                    >
                      <Download className="w-3 h-3" />
                      تنزيل
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1"
                      onClick={() => handleShare(file)}
                    >
                      <Share2 className="w-3 h-3" />
                      مشاركة
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-400 hover:text-red-300"
                      onClick={() => handleDelete(file)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-2">
            {filteredFiles.map((file) => {
              const isSelected = selectedFiles.has(file.id.toString());
              return (
              <Card
                key={file.id}
                className="bg-slate-800/50 border-slate-700 p-4 hover:border-cyan-500/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  {/* Thumbnail */}
                  {file.thumbnail && (
                    <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-slate-900">
                      <img
                        src={file.thumbnail}
                        alt={file.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white truncate">{file.title}</h3>
                      <span className="inline-flex items-center gap-1 text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded flex-shrink-0">
                        {getTypeIcon(file.type)}
                        {getTypeLabel(file.type)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                      <span>{formatFileSize(file.size)}</span>
                      {file.duration && <span>{formatDuration(file.duration)}</span>}
                      <span>{new Date(file.createdAt).toLocaleDateString('ar-SA')}</span>
                      <span>{file.downloadCount} تنزيل</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handlePreview(file)}
                      title="معاينة"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDownload(file)}
                      title="تنزيل"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleShare(file)}
                      title="مشاركة"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300"
                      onClick={() => handleDelete(file)}
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <MediaPreviewModal
        isOpen={isPreviewOpen}
        file={selectedFile}
        onClose={() => setIsPreviewOpen(false)}
        onDownload={handleDownload}
        onShare={handleShare}
      />

      {/* Statistics */}
      {filteredFiles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-slate-800/50 border-slate-700">
            <div className="text-sm text-slate-400">إجمالي الملفات</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">
              {filteredFiles.length}
            </div>
          </Card>
          <Card className="p-4 bg-slate-800/50 border-slate-700">
            <div className="text-sm text-slate-400">إجمالي الحجم</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">
              {formatFileSize(filteredFiles.reduce((sum, f) => sum + f.size, 0))}
            </div>
          </Card>
          <Card className="p-4 bg-slate-800/50 border-slate-700">
            <div className="text-sm text-slate-400">إجمالي التنزيلات</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">
              {filteredFiles.reduce((sum, f) => sum + (f.downloadCount || 0), 0)}
            </div>
          </Card>
          <Card className="p-4 bg-slate-800/50 border-slate-700">
            <div className="text-sm text-slate-400">المفضلة</div>
            <div className="text-2xl font-bold text-yellow-400 mt-1">
              {filteredFiles.filter((f) => f.isStarred).length}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
