import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MediaPreviewCard from '@/components/MediaPreviewCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Film,
  Image,
  Volume2,
  Loader2,
  Download,
  Eye,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface ContentGeneratorPanelProps {
  projectId: number;
}

export default function ContentGeneratorPanel({ projectId }: ContentGeneratorPanelProps) {
  const [activeTab, setActiveTab] = useState('video');
  const [videoText, setVideoText] = useState('');
  const [videoDuration, setVideoDuration] = useState(30);
  const [videoQuality, setVideoQuality] = useState('medium');
  const [videoSpeed, setVideoSpeed] = useState(1);
  const [videoStyle, setVideoStyle] = useState('cinematic');

  const [imageText, setImageText] = useState('');
  const [imageCount, setImageCount] = useState(1);
  const [imageQuality, setImageQuality] = useState('high');
  const [imageStyle, setImageStyle] = useState('realistic');

  const [audioText, setAudioText] = useState('');
  const [audioVoice, setAudioVoice] = useState('neutral');
  const [audioLanguage, setAudioLanguage] = useState('ar');
  const [audioSpeed, setAudioSpeed] = useState(1);

  const [generationId, setGenerationId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'completed' | 'error'>('idle');
  const [generationProgress, setGenerationProgress] = useState(0);

  // tRPC mutations
  const generateVideoMutation = trpc.contentGeneration.generateVideo.useMutation({
    onSuccess: (data) => {
      setGenerationId(data.generationId);
      toast.success('جاري معالجة الفيديو...');
      pollGenerationStatus(data.generationId);
    },
    onError: (error) => {
      toast.error('فشل في إنشاء الفيديو');
      setGenerationStatus('error');
    },
  });

  const generateImageMutation = trpc.contentGeneration.generateImage.useMutation({
    onSuccess: (data) => {
      setGenerationId(data.generationId);
      toast.success('جاري معالجة الصور...');
      pollGenerationStatus(data.generationId);
    },
    onError: (error) => {
      toast.error('فشل في إنشاء الصور');
      setGenerationStatus('error');
    },
  });

  const generateAudioMutation = trpc.contentGeneration.generateAudio.useMutation({
    onSuccess: (data) => {
      setGenerationId(data.generationId);
      toast.success('جاري معالجة الصوت...');
      pollGenerationStatus(data.generationId);
    },
    onError: (error) => {
      toast.error('فشل في إنشاء الصوت');
      setGenerationStatus('error');
    },
  });

  const getStatusQuery = trpc.contentGeneration.getStatus.useQuery(
    { generationId: generationId || '' },
    { enabled: !!generationId && generationStatus === 'generating', refetchInterval: 2000 }
  );

  const pollGenerationStatus = (id: string) => {
    setGenerationStatus('generating');
    // سيتم التحديث تلقائياً عبر useQuery
  };

  // مراقبة تحديثات الحالة
  useEffect(() => {
    if (getStatusQuery.data && generationStatus === 'generating') {
      setGenerationProgress(getStatusQuery.data.progress || 0);
      if (getStatusQuery.data.status === 'completed') {
        setGenerationStatus('completed');
        setPreviewUrl(getStatusQuery.data.result?.url || null);
        toast.success('تم إنشاء المحتوى بنجاح! ✅');
      } else if (getStatusQuery.data.status === 'failed') {
        setGenerationStatus('error');
        toast.error(getStatusQuery.data.error || 'فشل في المعالجة');
      }
    }
  }, [getStatusQuery.data, generationStatus]);

  const handleGenerateVideo = async () => {
    if (!videoText.trim()) {
      toast.error('الرجاء إدخال النص');
      return;
    }

    await generateVideoMutation.mutateAsync({
      text: videoText,
      duration: videoDuration,
      quality: videoQuality as 'low' | 'medium' | 'high',
      speed: videoSpeed,
      style: videoStyle as 'cinematic' | 'documentary' | 'animated' | 'minimal',
      projectId,
    });
  };

  const handleGenerateImage = async () => {
    if (!imageText.trim()) {
      toast.error('الرجاء إدخال النص');
      return;
    }

    await generateImageMutation.mutateAsync({
      text: imageText,
      count: imageCount,
      quality: imageQuality as 'low' | 'medium' | 'high',
      style: imageStyle as 'realistic' | 'artistic' | 'cartoon' | 'abstract',
      projectId,
    });
  };

  const handleGenerateAudio = async () => {
    if (!audioText.trim()) {
      toast.error('الرجاء إدخال النص');
      return;
    }

    await generateAudioMutation.mutateAsync({
      text: audioText,
      voice: audioVoice as 'male' | 'female' | 'neutral',
      language: audioLanguage as 'ar' | 'en' | 'fr',
      speed: audioSpeed,
      projectId,
    });
  };

  const handleDownload = () => {
    if (previewUrl) {
      const a = document.createElement('a');
      a.href = previewUrl;
      a.download = `content-${Date.now()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('تم التنزيل بنجاح');
    }
  };

  const renderPreview = () => {
    if (!previewUrl) return null;

    if (activeTab === 'video') {
      return (
        <video
          src={previewUrl}
          controls
          className="w-full rounded-lg bg-black"
          style={{ maxHeight: '400px' }}
        />
      );
    } else if (activeTab === 'image') {
      return (
        <img
          src={previewUrl}
          alt="Generated"
          className="w-full rounded-lg"
          style={{ maxHeight: '400px', objectFit: 'cover' }}
        />
      );
    } else if (activeTab === 'audio') {
      return (
        <audio
          src={previewUrl}
          controls
          className="w-full"
        />
      );
    }
  };

  return (
    <div className="w-full space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-700">
          <TabsTrigger value="video" className="gap-2">
            <Film className="w-4 h-4" />
            فيديو
          </TabsTrigger>
          <TabsTrigger value="image" className="gap-2">
            <Image className="w-4 h-4" />
            صور
          </TabsTrigger>
          <TabsTrigger value="audio" className="gap-2">
            <Volume2 className="w-4 h-4" />
            صوت
          </TabsTrigger>
        </TabsList>

        {/* تحويل النص إلى فيديو */}
        <TabsContent value="video" className="space-y-4">
          <Card className="p-4 bg-slate-700/50 border-slate-600 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-200 block mb-2">
                النص المراد تحويله إلى فيديو
              </label>
              <textarea
                value={videoText}
                onChange={(e) => setVideoText(e.target.value)}
                placeholder="أدخل النص الذي تريد تحويله إلى فيديو..."
                className="w-full h-24 p-3 bg-slate-600 border border-slate-500 rounded-lg text-slate-200 placeholder-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-200 block mb-2">
                  المدة (ثانية)
                </label>
                <input
                  type="range"
                  min="10"
                  max="1200"
                  value={videoDuration}
                  onChange={(e) => setVideoDuration(parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-slate-400 mt-1">{videoDuration} ثانية</p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-200 block mb-2">
                  السرعة
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={videoSpeed}
                  onChange={(e) => setVideoSpeed(parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-slate-400 mt-1">{videoSpeed.toFixed(1)}x</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-200 block mb-2">
                  الجودة
                </label>
                <Select value={videoQuality} onValueChange={setVideoQuality}>
                  <SelectTrigger className="bg-slate-600 border-slate-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="low">منخفضة</SelectItem>
                    <SelectItem value="medium">متوسطة</SelectItem>
                    <SelectItem value="high">عالية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-200 block mb-2">
                  النمط
                </label>
                <Select value={videoStyle} onValueChange={setVideoStyle}>
                  <SelectTrigger className="bg-slate-600 border-slate-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="cinematic">سينمائي</SelectItem>
                    <SelectItem value="documentary">وثائقي</SelectItem>
                    <SelectItem value="animated">متحرك</SelectItem>
                    <SelectItem value="minimal">بسيط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleGenerateVideo}
              disabled={generateVideoMutation.isPending || generationStatus === 'generating'}
              className="w-full bg-cyan-600 hover:bg-cyan-700"
            >
              {generateVideoMutation.isPending || generationStatus === 'generating' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  جاري المعالجة...
                </>
              ) : (
                <>
                  <Film className="w-4 h-4 mr-2" />
                  إنشاء فيديو
                </>
              )}
            </Button>
          </Card>
        </TabsContent>

        {/* تحويل النص إلى صور */}
        <TabsContent value="image" className="space-y-4">
          <Card className="p-4 bg-slate-700/50 border-slate-600 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-200 block mb-2">
                النص المراد تحويله إلى صور
              </label>
              <textarea
                value={imageText}
                onChange={(e) => setImageText(e.target.value)}
                placeholder="أدخل النص الذي تريد تحويله إلى صور..."
                className="w-full h-24 p-3 bg-slate-600 border border-slate-500 rounded-lg text-slate-200 placeholder-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-200 block mb-2">
                  عدد الصور
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={imageCount}
                  onChange={(e) => setImageCount(parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-slate-400 mt-1">{imageCount} صور</p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-200 block mb-2">
                  الجودة
                </label>
                <Select value={imageQuality} onValueChange={setImageQuality}>
                  <SelectTrigger className="bg-slate-600 border-slate-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="low">منخفضة</SelectItem>
                    <SelectItem value="medium">متوسطة</SelectItem>
                    <SelectItem value="high">عالية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-200 block mb-2">
                النمط
              </label>
              <Select value={imageStyle} onValueChange={setImageStyle}>
                <SelectTrigger className="bg-slate-600 border-slate-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="realistic">واقعي</SelectItem>
                  <SelectItem value="artistic">فني</SelectItem>
                  <SelectItem value="cartoon">رسوم متحركة</SelectItem>
                  <SelectItem value="abstract">تجريدي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerateImage}
              disabled={generateImageMutation.isPending || generationStatus === 'generating'}
              className="w-full bg-cyan-600 hover:bg-cyan-700"
            >
              {generateImageMutation.isPending || generationStatus === 'generating' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  جاري المعالجة...
                </>
              ) : (
                <>
                  <Image className="w-4 h-4 mr-2" />
                  إنشاء صور
                </>
              )}
            </Button>
          </Card>
        </TabsContent>

        {/* تحويل النص إلى صوت */}
        <TabsContent value="audio" className="space-y-4">
          <Card className="p-4 bg-slate-700/50 border-slate-600 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-200 block mb-2">
                النص المراد تحويله إلى صوت
              </label>
              <textarea
                value={audioText}
                onChange={(e) => setAudioText(e.target.value)}
                placeholder="أدخل النص الذي تريد تحويله إلى صوت..."
                className="w-full h-24 p-3 bg-slate-600 border border-slate-500 rounded-lg text-slate-200 placeholder-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-200 block mb-2">
                  الصوت
                </label>
                <Select value={audioVoice} onValueChange={setAudioVoice}>
                  <SelectTrigger className="bg-slate-600 border-slate-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="male">ذكر</SelectItem>
                    <SelectItem value="female">أنثى</SelectItem>
                    <SelectItem value="neutral">محايد</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-200 block mb-2">
                  اللغة
                </label>
                <Select value={audioLanguage} onValueChange={setAudioLanguage}>
                  <SelectTrigger className="bg-slate-600 border-slate-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">الإنجليزية</SelectItem>
                    <SelectItem value="fr">الفرنسية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-200 block mb-2">
                السرعة
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={audioSpeed}
                onChange={(e) => setAudioSpeed(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-slate-400 mt-1">{audioSpeed.toFixed(1)}x</p>
            </div>

            <Button
              onClick={handleGenerateAudio}
              disabled={generateAudioMutation.isPending || generationStatus === 'generating'}
              className="w-full bg-cyan-600 hover:bg-cyan-700"
            >
              {generateAudioMutation.isPending || generationStatus === 'generating' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  جاري المعالجة...
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 mr-2" />
                  إنشاء صوت
                </>
              )}
            </Button>
          </Card>
        </TabsContent>
      </Tabs>

      {/* المعاينة والتنزيل */}
      {generationStatus === 'generating' && (
        <Card className="p-4 bg-slate-700/50 border-slate-600 space-y-3">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            <p className="text-slate-200">جاري معالجة المحتوى...</p>
          </div>
          <div className="w-full bg-slate-600 rounded-full h-2 overflow-hidden">
            <div
              className="bg-cyan-500 h-full transition-all duration-300"
              style={{ width: `${generationProgress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">{generationProgress}%</p>
        </Card>
      )}

      {generationStatus === 'completed' && previewUrl && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle2 className="w-5 h-5" />
            <p className="font-medium">تم إنشاء المحتوى بنجاح!</p>
          </div>

          <MediaPreviewCard
            type={activeTab as 'video' | 'image' | 'audio'}
            url={previewUrl}
            title={`${activeTab === 'video' ? 'فيديو' : activeTab === 'image' ? 'صورة' : 'صوت'} - ${new Date().toLocaleString('ar-SA')}`}
            size={1024000}
            duration={activeTab === 'video' ? videoDuration : activeTab === 'audio' ? Math.floor(audioText.length / 10) : undefined}
            format={activeTab === 'video' ? 'mp4' : activeTab === 'image' ? 'jpg' : 'mp3'}
          />

          <Button
            onClick={() => {
              setGenerationStatus('idle');
              setPreviewUrl(null);
              setGenerationId(null);
            }}
            variant="outline"
            className="w-full"
          >
            إنشاء محتوى جديد
          </Button>
        </div>
      )}

      {generationStatus === 'error' && (
        <Card className="p-4 bg-red-900/20 border-red-700 space-y-3">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">حدث خطأ في المعالجة</p>
          </div>
          <Button
            onClick={() => setGenerationStatus('idle')}
            variant="outline"
            className="w-full"
          >
            محاولة مرة أخرى
          </Button>
        </Card>
      )}
    </div>
  );
}
