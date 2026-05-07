import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Play,
  Download,
  Trash2,
  Eye,
  Share2,
  Clock,
  Film,
  Save,
  Copy,
  Smartphone,
} from 'lucide-react';
import { toast } from 'sonner';
import MediaPreviewCard from '@/components/MediaPreviewCard';

interface Scene {
  id: string;
  title: string;
  duration: number;
  thumbnail: string;
  videoUrl: string;
  createdAt: Date;
  description: string;
}

interface SceneGalleryProps {
  projectId: number;
  scenes?: Scene[];
  onSceneSelect?: (scene: Scene) => void;
}

export default function SceneGallery({
  projectId,
  scenes = [],
  onSceneSelect,
}: SceneGalleryProps) {
  const [galleryScenes, setGalleryScenes] = useState<Scene[]>(scenes);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // تحميل المشاهد من قاعدة البيانات
  useEffect(() => {
    loadScenes();
  }, [projectId]);

  const loadScenes = async () => {
    setIsLoading(true);
    try {
      // محاكاة تحميل المشاهد من الخادم
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // في التطبيق الحقيقي، سيتم استدعاء API
      const mockScenes: Scene[] = [
        {
          id: '1',
          title: 'المشهد الأول - المقدمة',
          duration: 3,
          thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="120"%3E%3Crect fill="%23667eea" width="200" height="120"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="white"%3EScene 1%3C/text%3E%3C/svg%3E',
          videoUrl: 'https://example.com/scene1.mp4',
          createdAt: new Date(),
          description: 'مشهد افتتاحي مع نص متحرك',
        },
        {
          id: '2',
          title: 'المشهد الثاني - الحدث الرئيسي',
          duration: 8,
          thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="120"%3E%3Crect fill="%23764ba2" width="200" height="120"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="white"%3EScene 2%3C/text%3E%3C/svg%3E',
          videoUrl: 'https://example.com/scene2.mp4',
          createdAt: new Date(),
          description: 'الحدث الرئيسي مع حوار صوتي',
        },
        {
          id: '3',
          title: 'المشهد الثالث - الخاتمة',
          duration: 5,
          thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="120"%3E%3Crect fill="%23f093fb" width="200" height="120"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="white"%3EScene 3%3C/text%3E%3C/svg%3E',
          videoUrl: 'https://example.com/scene3.mp4',
          createdAt: new Date(),
          description: 'مشهد الخاتمة مع موسيقى خلفية',
        },
      ];

      setGalleryScenes(mockScenes);
    } catch (error) {
      toast.error('فشل تحميل المشاهد');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadScene = async (scene: Scene) => {
    try {
      const response = await fetch(scene.videoUrl);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${scene.title}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`تم تنزيل ${scene.title} بنجاح! ✅`);
    } catch (error) {
      toast.error('فشل التنزيل');
    }
  };

  const handleDeleteScene = async (sceneId: string) => {
    try {
      setGalleryScenes(galleryScenes.filter((s) => s.id !== sceneId));
      if (selectedScene?.id === sceneId) {
        setSelectedScene(null);
      }
      toast.success('تم حذف المشهد بنجاح! ✅');
    } catch (error) {
      toast.error('فشل حذف المشهد');
    }
  };

  const handleSaveScene = async (scene: Scene) => {
    try {
      // محاكاة حفظ المشهد في قاعدة البيانات
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success(`تم حفظ ${scene.title} بنجاح! ✅`);
    } catch (error) {
      toast.error('فشل حفظ المشهد');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
            <Film className="w-6 h-6" />
            معرض المشاهد
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {galleryScenes.length} مشهد متاح
          </p>
        </div>
        <Button
          onClick={loadScenes}
          disabled={isLoading}
          className="bg-cyan-600 hover:bg-cyan-700 gap-2"
        >
          {isLoading ? 'جاري التحميل...' : 'تحديث'}
        </Button>
      </div>

      {/* Gallery Grid */}
      {galleryScenes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {galleryScenes.map((scene) => (
            <Card
              key={scene.id}
              className={`overflow-hidden bg-slate-700/50 border-slate-600 hover:border-cyan-500/50 transition-all cursor-pointer ${
                selectedScene?.id === scene.id ? 'border-cyan-500' : ''
              }`}
              onClick={() => {
                setSelectedScene(scene);
                onSceneSelect?.(scene);
              }}
            >
              {/* Thumbnail */}
              <div className="relative group">
                <img
                  src={scene.thumbnail}
                  alt={scene.title}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    className="bg-cyan-600 hover:bg-cyan-700 gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedScene(scene);
                      setShowPreview(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                    معاينة
                  </Button>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadScene(scene);
                    }}
                  >
                    <Download className="w-4 h-4" />
                    تنزيل
                  </Button>
                </div>
                <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(scene.duration)}
                </div>
              </div>

              {/* Content */}
              <div className="p-3 space-y-2">
                <h3 className="font-semibold text-slate-200 truncate">
                  {scene.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {scene.description}
                </p>
                <p className="text-xs text-slate-500">
                  {formatDate(scene.createdAt)}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveScene(scene);
                    }}
                  >
                    <Save className="w-3 h-3" />
                    حفظ
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs text-red-400 hover:text-red-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteScene(scene.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                    حذف
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 bg-slate-700/50 border-slate-600 text-center">
          <Film className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-400">لا توجد مشاهد متاحة حالياً</p>
          <Button onClick={loadScenes} className="mt-4 gap-2">
            <Play className="w-4 h-4" />
            إنشاء مشهد جديد
          </Button>
        </Card>
      )}

      {/* Preview Section */}
      {selectedScene && showPreview && (
        <Card className="p-6 bg-slate-800/50 border-cyan-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-200">
              معاينة: {selectedScene.title}
            </h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowPreview(false)}
            >
              إغلاق
            </Button>
          </div>

          <MediaPreviewCard
            type="video"
            url={selectedScene.videoUrl}
            title={selectedScene.title}
            size={5242880}
            duration={selectedScene.duration}
            format="mp4"
          />

          {/* Scene Details */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-600">
            <div>
              <p className="text-xs text-slate-400">المدة</p>
              <p className="text-lg font-semibold text-cyan-400">
                {formatDuration(selectedScene.duration)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">تاريخ الإنشاء</p>
              <p className="text-sm text-slate-300">
                {formatDate(selectedScene.createdAt)}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-slate-400">الوصف</p>
              <p className="text-sm text-slate-300">{selectedScene.description}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 pt-4 border-t border-slate-600">
            <Button
              onClick={() => handleDownloadScene(selectedScene)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <Download className="w-4 h-4" />
              تنزيل الآن
            </Button>
            <Button
              onClick={() => handleSaveScene(selectedScene)}
              className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
            >
              <Save className="w-4 h-4" />
              حفظ المشهد
            </Button>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(selectedScene.videoUrl);
                toast.success('تم نسخ الرابط! ✅');
              }}
              variant="outline"
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Summary Stats */}
      {galleryScenes.length > 0 && (
        <Card className="p-4 bg-slate-700/50 border-slate-600">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-cyan-400">
                {galleryScenes.length}
              </p>
              <p className="text-xs text-slate-400">إجمالي المشاهد</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-cyan-400">
                {formatDuration(
                  galleryScenes.reduce((sum, s) => sum + s.duration, 0)
                )}
              </p>
              <p className="text-xs text-slate-400">المدة الكلية</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-cyan-400">
                {(
                  galleryScenes.reduce((sum) => sum + 5, 0) / 1024
                ).toFixed(1)}{' '}
                MB
              </p>
              <p className="text-xs text-slate-400">الحجم الكلي</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
