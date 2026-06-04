import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Download,
  Share2,
  Eye,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  processTextToVideo,
  processImagesToVideo,
  processTextToAudio,
  type ProcessingProgress,
  type ProcessingResult,
} from '@/lib/localMediaProcessor';

interface LocalMediaPreviewProps {
  type: 'video' | 'image' | 'audio';
  text?: string;
  files?: File[];
  duration: number;
  quality?: 'low' | 'medium' | 'high';
  style?: 'cinematic' | 'documentary' | 'animated' | 'minimal';
  voice?: 'female' | 'male' | 'neutral';
  speed?: number;
  onComplete?: (result: ProcessingResult) => void;
}

export default function LocalMediaPreview({
  type,
  text,
  files,
  duration,
  quality = 'high',
  style = 'cinematic',
  voice = 'female',
  speed = 1,
  onComplete,
}: LocalMediaPreviewProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // بدء المعالجة تلقائياً
  useEffect(() => {
    if (!isProcessing && !result && !error) {
      handleProcess();
    }
  }, []);

  const handleProcess = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      setProgress(null);

      let processingResult: ProcessingResult;

      if (type === 'video' && text) {
        processingResult = await processTextToVideo(
          text,
          duration,
          style as any,
          setProgress
        );
      } else if (type === 'image' && files && files.length > 0) {
        processingResult = await processImagesToVideo(
          files,
          duration,
          quality as any,
          setProgress
        );
      } else if (type === 'audio' && text) {
        processingResult = await processTextToAudio(
          text,
          voice as any,
          speed,
          setProgress
        );
      } else {
        throw new Error('بيانات غير صحيحة للمعالجة');
      }

      setResult(processingResult);
      setIsProcessing(false);
      toast.success('✅ تم المعالجة بنجاح!');

      if (onComplete) {
        onComplete(processingResult);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف';
      setError(errorMessage);
      setIsProcessing(false);
      toast.error(`❌ ${errorMessage}`);
    }
  };

  const handleDownload = async () => {
    if (!result) return;

    try {
      const url = result.url;
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-${Date.now()}.${result.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('✅ تم التنزيل بنجاح');
    } catch (err) {
      toast.error('❌ فشل التنزيل');
    }
  };

  const handleShare = async () => {
    if (!result) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${type} محتوى`,
          text: `تم إنشاء هذا ${type} محليًا في المتصفح - مجاني 100%`,
          url: result.url,
        });
        toast.success('✅ تم المشاركة');
      } else {
        await navigator.clipboard.writeText(result.url);
        toast.success('✅ تم نسخ الرابط');
      }
    } catch (err) {
      toast.error('❌ فشلت المشاركة');
    }
  };

  return (
    <div className="space-y-4">
      {/* Processing State */}
      {isProcessing && progress && (
        <Card className="p-6 bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-cyan-500/30 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
            <div>
              <h3 className="font-bold text-cyan-400">جاري المعالجة المحلية</h3>
              <p className="text-sm text-slate-400">معالجة مجاني 100% في المتصفح</p>
            </div>
          </div>

          {/* Progress Stages */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-medium text-slate-300">
                    {progress.stage}
                  </span>
                </div>
                <span className="text-sm font-bold text-cyan-400">
                  {progress.progress}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 h-full transition-all duration-300 animate-pulse"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>

              {/* Message */}
              <p className="text-xs text-slate-400 mt-2">{progress.message}</p>

              {/* ETA */}
              {progress.eta && (
                <p className="text-xs text-slate-500 mt-1">
                  الوقت المتبقي: {Math.ceil(progress.eta)} ثانية
                </p>
              )}
            </div>
          </div>

          {/* Processing Info */}
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-400">
              💡 جميع المعالجات تتم محليًا في متصفحك - لا توجد تحميلات على الخادم
            </p>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-4 bg-red-900/30 border-red-500/30 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-400">❌ حدث خطأ</p>
            <p className="text-sm text-red-300">{error}</p>
          </div>
          <Button
            onClick={handleProcess}
            variant="outline"
            size="sm"
            className="flex-shrink-0"
          >
            إعادة محاولة
          </Button>
        </Card>
      )}

      {/* Success State */}
      {result && !isProcessing && (
        <>
          <Card className="p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/30 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-400">✅ تم الإنشاء بنجاح!</p>
              <p className="text-sm text-green-300">
                المحتوى جاهز للمعاينة والتنزيل
              </p>
            </div>
          </Card>

          {/* Preview Container */}
          <Card className="p-6 bg-slate-800/50 border-cyan-500/20 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-slate-200">معاينة المحتوى</h3>
            </div>

            {/* Media Preview */}
            <div className="bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
              {type === 'video' && (
                <video
                  src={result.url}
                  controls
                  className="w-full h-full object-contain"
                />
              )}
              {type === 'image' && (
                <img
                  src={result.url}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              )}
              {type === 'audio' && (
                <div className="flex flex-col items-center gap-4 w-full">
                  <div className="text-4xl">🔊</div>
                  <audio
                    src={result.url}
                    controls
                    className="w-full max-w-md"
                  />
                </div>
              )}
            </div>

            {/* Media Info */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-700/50 p-3 rounded-lg">
                <p className="text-xs text-slate-400">الحجم</p>
                <p className="font-bold text-cyan-400">
                  {(result.size / 1024 / 1024).toFixed(2)}MB
                </p>
              </div>
              <div className="bg-slate-700/50 p-3 rounded-lg">
                <p className="text-xs text-slate-400">المدة</p>
                <p className="font-bold text-cyan-400">{result.duration}ث</p>
              </div>
              <div className="bg-slate-700/50 p-3 rounded-lg">
                <p className="text-xs text-slate-400">الصيغة</p>
                <p className="font-bold text-cyan-400">
                  {result.format.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-700">
              <Button
                onClick={handleDownload}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 gap-2"
              >
                <Download className="w-4 h-4" />
                تنزيل
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 gap-2"
              >
                <Share2 className="w-4 h-4" />
                مشاركة
              </Button>
            </div>

            {/* Free Info */}
            <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 p-3 rounded-lg border border-cyan-500/20">
              <p className="text-xs text-cyan-300 font-semibold">
                ✨ تم إنشاء هذا المحتوى محليًا في متصفحك - مجاني 100% بدون تحميلات على الخادم
              </p>
            </div>
          </Card>
        </>
      )}

      {/* Initial State */}
      {!isProcessing && !result && !error && (
        <Card className="p-6 bg-slate-800/50 border-slate-700 text-center">
          <div className="space-y-3">
            <Loader2 className="w-12 h-12 text-cyan-400 mx-auto animate-spin" />
            <p className="text-slate-300 font-medium">جاري بدء المعالجة...</p>
            <p className="text-xs text-slate-500">
              معالجة محلية مجاني 100% في المتصفح
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
