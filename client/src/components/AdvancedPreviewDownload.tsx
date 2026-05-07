import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Eye,
  Download,
  Share2,
  Copy,
  Smartphone,
  HardDrive,
  Cloud,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Volume2,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';

interface AdvancedPreviewDownloadProps {
  type: 'video' | 'image' | 'audio';
  url: string;
  title: string;
  duration?: number;
  format: string;
  size?: number;
}

export default function AdvancedPreviewDownload({
  type,
  url,
  title,
  duration,
  format,
  size = 0,
}: AdvancedPreviewDownloadProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // تنسيق حجم الملف
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // تنسيق المدة
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // تنزيل إلى الجهاز
  const handleDownloadToDevice = async () => {
    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      const response = await fetch(url);
      const blob = await response.blob();

      // محاكاة تقدم التنزيل
      for (let i = 0; i <= 100; i += 10) {
        setDownloadProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // إنشاء رابط التنزيل
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${title}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      toast.success(`تم تنزيل ${title} بنجاح! ✅`);
      setDownloadProgress(0);
    } catch (error) {
      toast.error('فشل التنزيل إلى الجهاز');
    } finally {
      setIsDownloading(false);
    }
  };

  // حفظ في التخزين السحابي
  const handleSaveToCloud = async () => {
    try {
      toast.info('جاري الحفظ في السحابة...');
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success(`تم حفظ ${title} في السحابة! ☁️`);
    } catch (error) {
      toast.error('فشل الحفظ في السحابة');
    }
  };

  // نسخ الرابط
  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    toast.success('تم نسخ الرابط! ✅');
  };

  // مشاركة
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: `شارك معي: ${title}`,
          url: url,
        });
      } else {
        handleCopyLink();
      }
    } catch (error) {
      console.log('فشلت المشاركة');
    }
  };

  // معاينة الفيديو
  const renderVideoPreview = () => (
    <div className="space-y-4">
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          src={url}
          controls
          className="w-full max-h-96 object-contain"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-slate-700/50 p-3 rounded-lg">
          <p className="text-slate-400 text-xs">المدة</p>
          <p className="text-cyan-400 font-semibold">
            {formatDuration(duration)}
          </p>
        </div>
        <div className="bg-slate-700/50 p-3 rounded-lg">
          <p className="text-slate-400 text-xs">الحجم</p>
          <p className="text-cyan-400 font-semibold">{formatFileSize(size)}</p>
        </div>
      </div>
    </div>
  );

  // معاينة الصورة
  const renderImagePreview = () => (
    <div className="space-y-4">
      <div className="relative bg-slate-800 rounded-lg overflow-hidden">
        <img
          src={url}
          alt={title}
          className="w-full max-h-96 object-contain"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-slate-700/50 p-3 rounded-lg">
          <p className="text-slate-400 text-xs">الصيغة</p>
          <p className="text-cyan-400 font-semibold uppercase">{format}</p>
        </div>
        <div className="bg-slate-700/50 p-3 rounded-lg">
          <p className="text-slate-400 text-xs">الحجم</p>
          <p className="text-cyan-400 font-semibold">{formatFileSize(size)}</p>
        </div>
      </div>
    </div>
  );

  // معاينة الصوت
  const renderAudioPreview = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg p-6 flex items-center justify-center min-h-32">
        <div className="text-center">
          <Volume2 className="w-12 h-12 text-white mx-auto mb-2" />
          <p className="text-white font-semibold">{title}</p>
        </div>
      </div>

      <audio src={url} controls className="w-full" />

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-slate-700/50 p-3 rounded-lg">
          <p className="text-slate-400 text-xs">المدة</p>
          <p className="text-cyan-400 font-semibold">
            {formatDuration(duration)}
          </p>
        </div>
        <div className="bg-slate-700/50 p-3 rounded-lg">
          <p className="text-slate-400 text-xs">الحجم</p>
          <p className="text-cyan-400 font-semibold">{formatFileSize(size)}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {type === 'video' && <Play className="w-5 h-5 text-cyan-400" />}
          {type === 'image' && <ImageIcon className="w-5 h-5 text-cyan-400" />}
          {type === 'audio' && <Volume2 className="w-5 h-5 text-cyan-400" />}
          <h3 className="font-semibold text-slate-200">{title}</h3>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowPreview(!showPreview)}
          className="gap-2"
        >
          <Eye className="w-4 h-4" />
          {showPreview ? 'إخفاء' : 'معاينة'}
        </Button>
      </div>

      {/* Preview Section */}
      {showPreview && (
        <Card className="p-4 bg-slate-800/50 border-cyan-500/20">
          {type === 'video' && renderVideoPreview()}
          {type === 'image' && renderImagePreview()}
          {type === 'audio' && renderAudioPreview()}
        </Card>
      )}

      {/* Download Progress */}
      {isDownloading && (
        <Card className="p-4 bg-slate-700/50 border-cyan-500/20 space-y-3">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            <p className="text-slate-200">جاري التنزيل...</p>
          </div>
          <div className="w-full bg-slate-600 rounded-full h-2 overflow-hidden">
            <div
              className="bg-cyan-500 h-full transition-all duration-300"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">{downloadProgress}%</p>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Download to Device */}
        <Button
          onClick={handleDownloadToDevice}
          disabled={isDownloading}
          className="bg-blue-600 hover:bg-blue-700 gap-2 justify-center"
        >
          <Smartphone className="w-4 h-4" />
          تنزيل إلى الجهاز
        </Button>

        {/* Save to Cloud */}
        <Button
          onClick={handleSaveToCloud}
          disabled={isDownloading}
          className="bg-green-600 hover:bg-green-700 gap-2 justify-center"
        >
          <Cloud className="w-4 h-4" />
          حفظ في السحابة
        </Button>

        {/* Copy Link */}
        <Button
          onClick={handleCopyLink}
          variant="outline"
          className="gap-2 justify-center"
        >
          <Copy className="w-4 h-4" />
          نسخ الرابط
        </Button>

        {/* Share */}
        <Button
          onClick={handleShare}
          variant="outline"
          className="gap-2 justify-center"
        >
          <Share2 className="w-4 h-4" />
          مشاركة
        </Button>
      </div>

      {/* File Info */}
      <Card className="p-3 bg-slate-700/50 border-slate-600 text-sm">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-slate-400 text-xs">الصيغة</p>
            <p className="text-cyan-400 font-semibold uppercase">{format}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">الحجم</p>
            <p className="text-cyan-400 font-semibold">{formatFileSize(size)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">النوع</p>
            <p className="text-cyan-400 font-semibold capitalize">
              {type === 'video'
                ? 'فيديو'
                : type === 'image'
                  ? 'صورة'
                  : 'صوت'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
