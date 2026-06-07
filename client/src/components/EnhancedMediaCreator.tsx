import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Film,
  Image,
  Volume2,
  Eye,
  Download,
  Play,
  Pause,
  Volume2 as VolumeIcon,
  VolumeX,
  Maximize,
  Minimize,
  Share2,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface EnhancedMediaCreatorProps {
  projectId: number;
}

interface MediaResult {
  id: string;
  type: 'video' | 'image' | 'audio';
  url: string;
  title: string;
  duration: number;
  size: number;
  createdAt: Date;
}

export default function EnhancedMediaCreator({ projectId }: EnhancedMediaCreatorProps) {
  // State Management
  const [activeTab, setActiveTab] = useState<'video' | 'image' | 'audio'>('video');
  const [videoText, setVideoText] = useState('');
  const [videoStyle, setVideoStyle] = useState('cinematic');
  const [videoDuration, setVideoDuration] = useState(10);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [audioText, setAudioText] = useState('');
  const [audioVoice, setAudioVoice] = useState('female');
  const [audioSpeed, setAudioSpeed] = useState(1);

  // Preview State
  const [previewMode, setPreviewMode] = useState<'none' | 'preview' | 'download'>('none');
  const [currentPreview, setCurrentPreview] = useState<MediaResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [createdMedia, setCreatedMedia] = useState<MediaResult[]>([]);

  // Simulate media generation
  const handleGenerateVideo = async () => {
    if (!videoText.trim()) {
      toast.error('❌ الرجاء إدخال نص');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    // Simulate generation progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.random() * 20;
      });
    }, 500);

    // Simulate generation completion
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);

      const newMedia: MediaResult = {
        id: `video-${Date.now()}`,
        type: 'video',
        url: URL.createObjectURL(
          new Blob(['video data'], { type: 'video/mp4' })
        ),
        title: `فيديو متقدم - ${new Date().toLocaleTimeString('ar-SA')}`,
        duration: videoDuration,
        size: Math.random() * 500 + 100,
        createdAt: new Date(),
      };

      setCreatedMedia((prev) => [newMedia, ...prev]);
      setCurrentPreview(newMedia);
      setPreviewMode('preview');
      setIsGenerating(false);
      toast.success('✅ تم إنشاء الفيديو بنجاح!');
    }, 3000);
  };

  const handleGenerateImage = async () => {
    if (imageFiles.length === 0) {
      toast.error('❌ الرجاء اختيار صور');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.random() * 20;
      });
    }, 500);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);

      const newMedia: MediaResult = {
        id: `image-${Date.now()}`,
        type: 'image',
        url: URL.createObjectURL(imageFiles[0]),
        title: `فيديو من الصور - ${new Date().toLocaleTimeString('ar-SA')}`,
        duration: 15,
        size: imageFiles.reduce((sum, f) => sum + f.size, 0) / 1024,
        createdAt: new Date(),
      };

      setCreatedMedia((prev) => [newMedia, ...prev]);
      setCurrentPreview(newMedia);
      setPreviewMode('preview');
      setIsGenerating(false);
      toast.success('✅ تم إنشاء الفيديو من الصور بنجاح!');
    }, 3000);
  };

  const handleGenerateAudio = async () => {
    if (!audioText.trim()) {
      toast.error('❌ الرجاء إدخال نص');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.random() * 20;
      });
    }, 500);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);

      const newMedia: MediaResult = {
        id: `audio-${Date.now()}`,
        type: 'audio',
        url: URL.createObjectURL(
          new Blob(['audio data'], { type: 'audio/mp3' })
        ),
        title: `صوت متقدم - ${new Date().toLocaleTimeString('ar-SA')}`,
        duration: Math.ceil(audioText.length / 10),
        size: Math.random() * 50 + 10,
        createdAt: new Date(),
      };

      setCreatedMedia((prev) => [newMedia, ...prev]);
      setCurrentPreview(newMedia);
      setPreviewMode('preview');
      setIsGenerating(false);
      toast.success('✅ تم إنشاء الصوت بنجاح!');
    }, 3000);
  };

  const handleDownload = () => {
    if (!currentPreview) return;

    const link = document.createElement('a');
    link.href = currentPreview.url;
    link.download = `${currentPreview.title}.${currentPreview.type === 'audio' ? 'mp3' : currentPreview.type === 'image' ? 'mp4' : 'mp4'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('✅ تم تنزيل الملف بنجاح!');
  };

  const handleShare = async () => {
    if (!currentPreview) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: currentPreview.title,
          text: `تحقق من هذا ${currentPreview.type === 'audio' ? 'الصوت' : 'الفيديو'} الرائع!`,
          url: currentPreview.url,
        });
        toast.success('✅ تم المشاركة بنجاح!');
      } catch (error) {
        toast.error('❌ فشل في المشاركة');
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(currentPreview.url);
      toast.success('✅ تم نسخ الرابط!');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Creator Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-cyan-500/20">
            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'video'
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-gray-400 hover:text-cyan-400'
              }`}
            >
              <Film size={18} />
              فيديو متقدم
            </button>
            <button
              onClick={() => setActiveTab('image')}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'image'
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-gray-400 hover:text-cyan-400'
              }`}
            >
              <Image size={18} />
              من الصور
            </button>
            <button
              onClick={() => setActiveTab('audio')}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'audio'
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-gray-400 hover:text-cyan-400'
              }`}
            >
              <Volume2 size={18} />
              صوت متقدم
            </button>
          </div>

          {/* Video Tab */}
          {activeTab === 'video' && (
            <Card className="p-6 bg-slate-900/50 border-cyan-500/20">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-cyan-400 mb-2">
                    النص (حتى 20 دقيقة)
                  </label>
                  <Textarea
                    placeholder="أدخل نص طويل لإنشاء فيديو متقدم مع مشاهد متحركة وبيئات ديناميكية..."
                    value={videoText}
                    onChange={(e) => setVideoText(e.target.value)}
                    className="h-32 bg-slate-800 border-cyan-500/30 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-cyan-400 mb-2">
                      الأسلوب
                    </label>
                    <Select value={videoStyle} onValueChange={setVideoStyle}>
                      <SelectTrigger className="bg-slate-800 border-cyan-500/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cinematic">سينمائي</SelectItem>
                        <SelectItem value="documentary">وثائقي</SelectItem>
                        <SelectItem value="animated">متحرك</SelectItem>
                        <SelectItem value="minimal">بسيط</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-cyan-400 mb-2">
                      المدة: {videoDuration} دقيقة
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={videoDuration}
                      onChange={(e) => setVideoDuration(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleGenerateVideo}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-black font-bold"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <Film className="mr-2" size={18} />
                      إنشاء فيديو متقدم
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* Image Tab */}
          {activeTab === 'image' && (
            <Card className="p-6 bg-slate-900/50 border-cyan-500/20">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-cyan-400 mb-2">
                    اختر الصور (حتى 15 دقيقة)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                    className="w-full"
                  />
                  {imageFiles.length > 0 && (
                    <p className="text-sm text-cyan-400 mt-2">
                      تم اختيار {imageFiles.length} صورة
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleGenerateImage}
                  disabled={isGenerating || imageFiles.length === 0}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-black font-bold"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <Image className="mr-2" size={18} />
                      إنشاء فيديو متقدم
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* Audio Tab */}
          {activeTab === 'audio' && (
            <Card className="p-6 bg-slate-900/50 border-cyan-500/20">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-cyan-400 mb-2">
                    النص
                  </label>
                  <Textarea
                    placeholder="أدخل نص طويل لتحويله إلى صوت طبيعي متزامن مع الفيديو..."
                    value={audioText}
                    onChange={(e) => setAudioText(e.target.value)}
                    className="h-32 bg-slate-800 border-cyan-500/30 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-cyan-400 mb-2">
                      الصوت
                    </label>
                    <Select value={audioVoice} onValueChange={setAudioVoice}>
                      <SelectTrigger className="bg-slate-800 border-cyan-500/30">
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
                    <label className="block text-sm font-medium text-cyan-400 mb-2">
                      السرعة: {audioSpeed.toFixed(1)}x
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={audioSpeed}
                      onChange={(e) => setAudioSpeed(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleGenerateAudio}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-black font-bold"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <Volume2 className="mr-2" size={18} />
                      إنشاء صوت متقدم
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* Progress Bar */}
          {isGenerating && (
            <Card className="p-4 bg-slate-900/50 border-cyan-500/20">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-400">جاري المعالجة...</span>
                  <span className="text-cyan-400">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Preview Panel */}
        <div className="space-y-4">
          {currentPreview && (
            <Card className="p-4 bg-slate-900/50 border-cyan-500/20">
              <div className="space-y-4">
                <h3 className="text-cyan-400 font-bold text-sm">المعاينة</h3>

                {/* Preview Display */}
                {currentPreview.type === 'audio' ? (
                  <div className="bg-slate-800 rounded-lg p-4 flex items-center justify-center h-32">
                    <Volume2 size={32} className="text-cyan-400" />
                  </div>
                ) : (
                  <div className="bg-slate-800 rounded-lg overflow-hidden h-32 flex items-center justify-center">
                    <video
                      src={currentPreview.url}
                      className="w-full h-full object-cover"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />
                  </div>
                )}

                {/* Media Info */}
                <div className="text-xs text-gray-400 space-y-1">
                  <p>المدة: {currentPreview.duration} دقيقة</p>
                  <p>الحجم: {currentPreview.size.toFixed(1)} MB</p>
                  <p>الوقت: {currentPreview.createdAt.toLocaleTimeString('ar-SA')}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => setPreviewMode(previewMode === 'preview' ? 'none' : 'preview')}
                    size="sm"
                    className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400"
                  >
                    <Eye size={16} />
                  </Button>
                  <Button
                    onClick={handleDownload}
                    size="sm"
                    className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400"
                  >
                    <Download size={16} />
                  </Button>
                  <Button
                    onClick={handleShare}
                    size="sm"
                    className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400"
                  >
                    <Share2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Recent Media */}
          {createdMedia.length > 0 && (
            <Card className="p-4 bg-slate-900/50 border-cyan-500/20">
              <h3 className="text-cyan-400 font-bold text-sm mb-3">الملفات المُنشأة</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {createdMedia.map((media) => (
                  <div
                    key={media.id}
                    onClick={() => setCurrentPreview(media)}
                    className={`p-2 rounded cursor-pointer transition-colors ${
                      currentPreview?.id === media.id
                        ? 'bg-cyan-500/30 border border-cyan-500'
                        : 'bg-slate-800/50 hover:bg-slate-800'
                    }`}
                  >
                    <p className="text-xs text-cyan-400 truncate">{media.title}</p>
                    <p className="text-xs text-gray-500">{media.duration} دقيقة</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
