import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface ExportModalProps {
  projectId: number;
  projectName: string;
  totalDuration: number;
}

const FORMAT_INFO = {
  mp4: {
    label: 'MP4 (H.264)',
    description: 'صيغة عالمية عالية الجودة',
    icon: '🎬',
    defaultQuality: 'high',
  },
  webm: {
    label: 'WebM (VP9)',
    description: 'صيغة محسّنة للويب',
    icon: '🌐',
    defaultQuality: 'medium',
  },
  gif: {
    label: 'GIF (Animated)',
    description: 'صيغة متحركة للمشاركة السريعة',
    icon: '🎞️',
    defaultQuality: 'medium',
  },
};

const QUALITY_INFO = {
  low: {
    label: 'منخفضة',
    description: 'حجم صغير، جودة أقل',
    bitrate: '2000k',
    fps: 24,
  },
  medium: {
    label: 'متوسطة',
    description: 'توازن بين الحجم والجودة',
    bitrate: '5000k',
    fps: 30,
  },
  high: {
    label: 'عالية',
    description: 'أفضل جودة، حجم أكبر',
    bitrate: '10000k',
    fps: 60,
  },
};

export default function ExportModal({
  projectId,
  projectName,
  totalDuration,
}: ExportModalProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<'mp4' | 'webm' | 'gif'>('mp4');
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('high');
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>(
    'idle'
  );
  const [exportedUrl, setExportedUrl] = useState('');

  // tRPC mutations for export
  const exportMP4Mutation = trpc.export.exportAsMP4.useMutation({
    onSuccess: (data) => {
      setExportProgress(100);
      setExportStatus('success');
      setExportedUrl(data.url);
      toast.success('تم تصدير الفيديو بنجاح ✅');

      // Auto-download after 2 seconds
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = data.url;
        a.download = `${projectName}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, 2000);
    },
    onError: (error) => {
      setExportStatus('error');
      toast.error('فشل في تصدير الفيديو');
      console.error(error);
    },
  });

  const exportWebMMutation = trpc.export.exportAsWebM.useMutation({
    onSuccess: (data) => {
      setExportProgress(100);
      setExportStatus('success');
      setExportedUrl(data.url);
      toast.success('تم تصدير الفيديو بنجاح ✅');

      setTimeout(() => {
        const a = document.createElement('a');
        a.href = data.url;
        a.download = `${projectName}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, 2000);
    },
    onError: (error) => {
      setExportStatus('error');
      toast.error('فشل في تصدير الفيديو');
      console.error(error);
    },
  });

  const exportGIFMutation = trpc.export.exportAsGIF.useMutation({
    onSuccess: (data) => {
      setExportProgress(100);
      setExportStatus('success');
      setExportedUrl(data.url);
      toast.success('تم تصدير الفيديو بنجاح ✅');

      setTimeout(() => {
        const a = document.createElement('a');
        a.href = data.url;
        a.download = `${projectName}.gif`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, 2000);
    },
    onError: (error) => {
      setExportStatus('error');
      toast.error('فشل في تصدير الفيديو');
      console.error(error);
    },
  });

  const estimateFileSize = () => {
    const qualityInfo = QUALITY_INFO[quality];
    const durationInSeconds = totalDuration / 1000;
    const bitrateInKbps = parseInt(qualityInfo.bitrate);
    const sizeInMB = (bitrateInKbps * durationInSeconds) / 8 / 1024;
    return sizeInMB.toFixed(2);
  };

  const estimateExportTime = () => {
    const durationInSeconds = totalDuration / 1000;
    const qualityMultiplier = quality === 'low' ? 0.5 : quality === 'medium' ? 1 : 2;
    const estimatedSeconds = durationInSeconds * qualityMultiplier;
    return Math.ceil(estimatedSeconds);
  };

  const handleExport = async () => {
    setExportStatus('exporting');
    setExportProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 20;
      });
    }, 500);

    try {
      const fps = format === 'gif' ? QUALITY_INFO[quality].fps : undefined;

      if (format === 'mp4') {
        await exportMP4Mutation.mutateAsync({
          projectId,
          quality,
        });
      } else if (format === 'webm') {
        await exportWebMMutation.mutateAsync({
          projectId,
          quality,
        });
      } else if (format === 'gif') {
        await exportGIFMutation.mutateAsync({
          projectId,
          fps: fps || 10,
        });
      }

      clearInterval(progressInterval);
    } catch (error) {
      clearInterval(progressInterval);
      console.error(error);
    }
  };

  const handleDownload = () => {
    if (exportedUrl) {
      const a = document.createElement('a');
      a.href = exportedUrl;
      a.download = `${projectName}.${format === 'gif' ? 'gif' : format === 'webm' ? 'webm' : 'mp4'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleReset = () => {
    setExportStatus('idle');
    setExportProgress(0);
    setExportedUrl('');
  };

  const isExporting =
    exportMP4Mutation.isPending || exportWebMMutation.isPending || exportGIFMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          تصدير
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">تصدير الفيديو</DialogTitle>
          <DialogDescription className="text-slate-400">
            اختر صيغة وجودة التصدير للمشروع "{projectName}"
          </DialogDescription>
        </DialogHeader>

        {exportStatus === 'idle' && (
          <div className="space-y-6">
            {/* Format Selection */}
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-200">اختر الصيغة</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(Object.entries(FORMAT_INFO) as Array<[keyof typeof FORMAT_INFO, any]>).map(
                  ([key, info]) => (
                    <Card
                      key={key}
                      onClick={() => setFormat(key)}
                      className={`p-4 cursor-pointer transition-all ${
                        format === key
                          ? 'bg-cyan-600/20 border-cyan-500'
                          : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <div className="text-2xl mb-2">{info.icon}</div>
                      <p className="font-semibold text-slate-200">{info.label}</p>
                      <p className="text-xs text-slate-400">{info.description}</p>
                    </Card>
                  )
                )}
              </div>
            </div>

            {/* Quality Selection */}
            <div className="space-y-3 border-t border-slate-700 pt-6">
              <h3 className="font-semibold text-slate-200">اختر الجودة</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(Object.entries(QUALITY_INFO) as Array<[keyof typeof QUALITY_INFO, any]>).map(
                  ([key, info]) => (
                    <Card
                      key={key}
                      onClick={() => setQuality(key)}
                      className={`p-4 cursor-pointer transition-all ${
                        quality === key
                          ? 'bg-cyan-600/20 border-cyan-500'
                          : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <p className="font-semibold text-slate-200">{info.label}</p>
                      <p className="text-xs text-slate-400 mb-2">{info.description}</p>
                      <div className="text-xs text-cyan-400">
                        <p>FPS: {info.fps}</p>
                        <p>Bitrate: {info.bitrate}</p>
                      </div>
                    </Card>
                  )
                )}
              </div>
            </div>

            {/* Export Info */}
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">حجم الملف المتوقع:</span>
                <span className="text-cyan-400 font-semibold">{estimateFileSize()} MB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">وقت التصدير المتوقع:</span>
                <span className="text-cyan-400 font-semibold">{estimateExportTime()} ثانية</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">مدة الفيديو:</span>
                <span className="text-cyan-400 font-semibold">
                  {Math.floor(totalDuration / 60000)}:{Math.floor((totalDuration % 60000) / 1000)
                    .toString()
                    .padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Export Button */}
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  جاري التصدير...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  ابدأ التصدير
                </>
              )}
            </Button>
          </div>
        )}

        {exportStatus === 'exporting' && (
          <div className="space-y-6 py-8">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-200">جاري تصدير الفيديو...</p>
              <p className="text-sm text-slate-400 mt-2">
                الرجاء عدم إغلاق هذه النافذة أثناء التصدير
              </p>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-cyan-500 h-full transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
            <p className="text-center text-sm text-slate-400">{Math.round(exportProgress)}%</p>
          </div>
        )}

        {exportStatus === 'success' && (
          <div className="space-y-6 py-8">
            <div className="text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-200">تم التصدير بنجاح! ✅</p>
              <p className="text-sm text-slate-400 mt-2">
                سيتم تحميل الملف تلقائياً في غضون ثوانٍ
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleDownload}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700"
              >
                <Download className="w-4 h-4 mr-2" />
                تحميل الآن
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex-1"
              >
                تصدير آخر
              </Button>
            </div>
          </div>
        )}

        {exportStatus === 'error' && (
          <div className="space-y-6 py-8">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-200">فشل التصدير ❌</p>
              <p className="text-sm text-slate-400 mt-2">
                حدث خطأ أثناء تصدير الفيديو. الرجاء المحاولة مرة أخرى
              </p>
            </div>
            <Button
              onClick={handleReset}
              className="w-full bg-cyan-600 hover:bg-cyan-700"
            >
              محاولة مرة أخرى
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
