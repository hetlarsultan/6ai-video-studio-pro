import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MediaPreviewCard from '@/components/MediaPreviewCard';
import SceneGallery from '@/components/SceneGallery';
import AdvancedPreviewDownload from '@/components/AdvancedPreviewDownload';
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

export default function ContentGeneratorPanel({
  projectId,
}: ContentGeneratorPanelProps) {
  const [activeTab, setActiveTab] = useState<'video' | 'image' | 'audio'>('video');

  // Video states
  const [videoText, setVideoText] = useState('');
  const [videoStyle, setVideoStyle] = useState<'cinematic' | 'documentary' | 'animated' | 'minimal'>('cinematic');
  const [videoDuration, setVideoDuration] = useState(10);

  // Image states
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageDuration, setImageDuration] = useState(5);

  // Audio states
  const [audioText, setAudioText] = useState('');
  const [audioVoice, setAudioVoice] = useState<'female' | 'male' | 'neutral'>('female');
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
    },
    onError: () => {
      setGenerationStatus('error');
      toast.error('فشل في إنشاء الفيديو');
    },
  });

  const generateImageMutation = trpc.contentGeneration.generateImage.useMutation({
    onSuccess: (data) => {
      setGenerationId(data.generationId);
      toast.success('جاري معالجة الصور...');
    },
    onError: () => {
      setGenerationStatus('error');
      toast.error('فشل في إنشاء الصور');
    },
  });

  const generateAudioMutation = trpc.contentGeneration.generateAudio.useMutation({
    onSuccess: (data) => {
      setGenerationId(data.generationId);
      toast.success('جاري معالجة الصوت...');
    },
    onError: () => {
      setGenerationStatus('error');
      toast.error('فشل في إنشاء الصوت');
    },
  });

  const getStatusQuery = trpc.contentGeneration.getStatus.useQuery(
    { generationId: generationId || '' },
    {
      enabled: !!generationId && generationStatus === 'generating',
      refetchInterval: 1000,
    }
  );

  const handleGenerateVideo = async () => {
    if (!videoText.trim()) {
      toast.error('الرجاء إدخال النص');
      return;
    }
    setGenerationStatus('generating');
    generateVideoMutation.mutate({
      projectId,
      text: videoText,
      style: videoStyle,
      duration: videoDuration,
    });
  };

  const handleGenerateImage = async () => {
    if (imageFiles.length === 0) {
      toast.error('الرجاء اختيار صور');
      return;
    }
    setGenerationStatus('generating');
    generateImageMutation.mutate({
      projectId,
      text: 'صور متحركة',
      count: imageFiles.length,
      quality: 'high',
      style: 'realistic',
    });
  };

  const handleGenerateAudio = async () => {
    if (!audioText.trim()) {
      toast.error('الرجاء إدخال النص');
      return;
    }
    setGenerationStatus('generating');
    generateAudioMutation.mutate({
      projectId,
      text: audioText,
      voice: audioVoice,
      speed: audioSpeed,
    });
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

  const renderPreview = () => {
    if (activeTab === 'video') {
      return (
        <video
          src={previewUrl || ''}
          controls
          className="w-full rounded-lg bg-black"
          style={{ maxHeight: '400px' }}
        />
      );
    } else if (activeTab === 'image') {
      return (
        <img
          src={previewUrl || ''}
          alt="Generated"
          className="w-full rounded-lg"
          style={{ maxHeight: '400px', objectFit: 'cover' }}
        />
      );
    } else if (activeTab === 'audio') {
      return (
        <audio
          src={previewUrl || ''}
          controls
          className="w-full"
        />
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Tabs */}
      <Tabs defaultValue="generator" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="generator">إنشاء محتوى</TabsTrigger>
          <TabsTrigger value="gallery">معرض المشاهد</TabsTrigger>
        </TabsList>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="space-y-4">
          <SceneGallery projectId={projectId} />
        </TabsContent>

        {/* Generator Tab */}
        <TabsContent value="generator" className="space-y-6">
          {/* Content Type Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
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

            {/* Video Tab */}
            <TabsContent value="video" className="space-y-4">
              <Card className="p-6 bg-slate-800/50 border-cyan-500/20">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Film className="w-5 h-5 text-cyan-400" />
                  فيديو متقدم من النص
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300">النص</label>
                    <textarea
                      value={videoText}
                      onChange={(e) => setVideoText(e.target.value)}
                      placeholder="أدخل النص الذي تريد تحويله إلى فيديو..."
                      className="w-full mt-2 p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:border-cyan-500 outline-none"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-300">النمط</label>
                      <Select value={videoStyle} onValueChange={(v) => setVideoStyle(v as any)}>
                        <SelectTrigger className="mt-2 bg-slate-700 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                      <SelectItem value="cinematic">سينمائي</SelectItem>
                      <SelectItem value="documentary">وثائقي</SelectItem>
                      <SelectItem value="minimal">بسيط</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-300">المدة (ثانية)</label>
                      <Input
                        type="number"
                        value={videoDuration}
                        onChange={(e) => setVideoDuration(parseInt(e.target.value))}
                        min="5"
                        max="1200"
                        className="mt-2 bg-slate-700 border-slate-600"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerateVideo}
                    disabled={generationStatus === 'generating'}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 gap-2"
                  >
                    <Film className="w-4 h-4" />
                    {generationStatus === 'generating' ? 'جاري الإنشاء...' : 'إنشاء فيديو'}
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* Image Tab */}
            <TabsContent value="image" className="space-y-4">
              <Card className="p-6 bg-slate-800/50 border-cyan-500/20">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Image className="w-5 h-5 text-cyan-400" />
                  فيديو متقدم من الصور
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300">اختيار الصور</label>
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                      className="mt-2 bg-slate-700 border-slate-600"
                    />
                    <p className="text-xs text-slate-400 mt-2">
                      {imageFiles.length} صورة مختارة
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-300">المدة لكل صورة (ثانية)</label>
                    <Input
                      type="number"
                      value={imageDuration}
                      onChange={(e) => setImageDuration(parseInt(e.target.value))}
                      min="1"
                      max="60"
                      className="mt-2 bg-slate-700 border-slate-600"
                    />
                  </div>

                  <Button
                    onClick={handleGenerateImage}
                    disabled={generationStatus === 'generating' || imageFiles.length === 0}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 gap-2"
                  >
                    <Image className="w-4 h-4" />
                    {generationStatus === 'generating' ? 'جاري الإنشاء...' : 'إنشاء فيديو'}
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* Audio Tab */}
            <TabsContent value="audio" className="space-y-4">
              <Card className="p-6 bg-slate-800/50 border-cyan-500/20">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-cyan-400" />
                  صوت متقدم من النص
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300">النص</label>
                    <textarea
                      value={audioText}
                      onChange={(e) => setAudioText(e.target.value)}
                      placeholder="أدخل النص الذي تريد تحويله إلى صوت..."
                      className="w-full mt-2 p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:border-cyan-500 outline-none"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-300">الصوت</label>
                      <Select value={audioVoice} onValueChange={(v) => setAudioVoice(v as any)}>
                        <SelectTrigger className="mt-2 bg-slate-700 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="female">أنثى</SelectItem>
                          <SelectItem value="male">ذكر</SelectItem>
                          <SelectItem value="neutral">محايد</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-300">السرعة</label>
                      <Input
                        type="number"
                        value={audioSpeed}
                        onChange={(e) => setAudioSpeed(parseFloat(e.target.value))}
                        min="0.5"
                        max="2"
                        step="0.1"
                        className="mt-2 bg-slate-700 border-slate-600"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerateAudio}
                    disabled={generationStatus === 'generating'}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 gap-2"
                  >
                    <Volume2 className="w-4 h-4" />
                    {generationStatus === 'generating' ? 'جاري الإنشاء...' : 'إنشاء صوت'}
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Status Section */}
          {generationStatus === 'generating' && (
            <Card className="p-4 bg-slate-700/50 border-cyan-500/20 space-y-3">
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

              <AdvancedPreviewDownload
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
