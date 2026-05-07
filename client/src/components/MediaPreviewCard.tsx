import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Download,
  Eye,
  Share2,
  Copy,
  Smartphone,
  Maximize2,
  FileDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

interface MediaPreviewCardProps {
  type: 'video' | 'image' | 'audio';
  url: string;
  title: string;
  size: number;
  duration?: number;
  format: string;
}

export default function MediaPreviewCard({
  type,
  url,
  title,
  size,
  duration,
  format,
}: MediaPreviewCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${title}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`تم تنزيل ${title} بنجاح! ✅`);
    } catch (error) {
      toast.error('فشل التنزيل');
    }
  };

  const handleDownloadToPhone = async () => {
    try {
      // محاكاة إرسال إلى الهاتف عبر QR code أو رابط مشاركة
      const shareData = {
        title: title,
        text: `تنزيل ${title}`,
        url: url,
      };

      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('تم المشاركة بنجاح! ✅');
      } else {
        // fallback: نسخ الرابط
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('تم نسخ الرابط! يمكنك مشاركته مباشرة');
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      toast.error('فشل في المشاركة');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('تم نسخ الرابط! ✅');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('فشل نسخ الرابط');
    }
  };

  const renderPreview = () => {
    if (type === 'video') {
      return (
        <video
          src={url}
          controls
          className="w-full rounded-lg bg-black"
          style={{ maxHeight: '400px' }}
        />
      );
    } else if (type === 'image') {
      return (
        <img
          src={url}
          alt={title}
          className="w-full rounded-lg"
          style={{ maxHeight: '400px', objectFit: 'cover' }}
        />
      );
    } else if (type === 'audio') {
      return (
        <div className="space-y-3">
          <audio
            src={url}
            controls
            className="w-full"
          />
          <div className="text-sm text-slate-400 space-y-1">
            <p>🎵 {title}</p>
            {duration && <p>⏱️ المدة: {formatDuration(duration)}</p>}
            <p>📦 الحجم: {formatFileSize(size)}</p>
          </div>
        </div>
      );
    }
  };

  return (
    <Card className="p-4 bg-slate-700/50 border-slate-600 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
          <div className="flex gap-4 text-sm text-slate-400 mt-1">
            <span>📦 {formatFileSize(size)}</span>
            {duration && <span>⏱️ {formatDuration(duration)}</span>}
            <span>📄 {format.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      {showPreview && (
        <div className="border-t border-slate-600 pt-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-300">المعاينة:</p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowPreview(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                إغلاق
              </Button>
            </div>
            {renderPreview()}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {/* Preview Button */}
        <Button
          onClick={() => setShowPreview(!showPreview)}
          className="bg-cyan-600 hover:bg-cyan-700 gap-2"
          size="sm"
        >
          <Eye className="w-4 h-4" />
          {showPreview ? 'إغلاق المعاينة' : 'معاينة'}
        </Button>

        {/* Download Button */}
        <Button
          onClick={handleDownload}
          className="bg-blue-600 hover:bg-blue-700 gap-2"
          size="sm"
        >
          <Download className="w-4 h-4" />
          تنزيل
        </Button>

        {/* Download to Phone Button */}
        <Button
          onClick={handleDownloadToPhone}
          className="bg-purple-600 hover:bg-purple-700 gap-2"
          size="sm"
        >
          <Smartphone className="w-4 h-4" />
          إلى الهاتف
        </Button>

        {/* Copy Link Button */}
        <Button
          onClick={handleCopyLink}
          className={`gap-2 ${
            copied
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-slate-600 hover:bg-slate-700'
          }`}
          size="sm"
        >
          <Copy className="w-4 h-4" />
          {copied ? 'تم النسخ!' : 'نسخ الرابط'}
        </Button>
      </div>

      {/* Share Button */}
      <Button
        onClick={handleDownloadToPhone}
        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 gap-2"
      >
        <Share2 className="w-4 h-4" />
        مشاركة سريعة
      </Button>

      {/* Download Info */}
      <div className="bg-slate-600/30 rounded-lg p-3 text-xs text-slate-300 space-y-1">
        <p>💡 يمكنك تنزيل الملف مباشرة أو مشاركته عبر الهاتف</p>
        <p>📱 استخدم "إلى الهاتف" لإرسال الملف إلى جهازك المحمول</p>
      </div>
    </Card>
  );
}
