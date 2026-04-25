import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Search, Star, Play, Download, Filter } from 'lucide-react';

/**
 * Templates Library Page
 * Browse and select pre-built video templates
 */
export default function Templates() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // API calls
  const getAllTemplates = trpc.templates.templates.getAll.useQuery();
  const getTemplatesByCategory = trpc.templates.templates.getByCategory.useQuery(
    { category: selectedCategory },
    { enabled: selectedCategory !== 'all' }
  );
  const getTemplateDetail = trpc.templates.templates.getDetail.useQuery(
    { templateId: selectedTemplate?.id },
    { enabled: !!selectedTemplate }
  );

  const categories = [
    { id: 'all', name: 'الكل', icon: '📺' },
    { id: 'marketing', name: 'تسويق', icon: '📢' },
    { id: 'education', name: 'تعليم', icon: '🎓' },
    { id: 'tutorial', name: 'شرح', icon: '📚' },
    { id: 'intro', name: 'مقدمة', icon: '🎬' },
    { id: 'outro', name: 'خاتمة', icon: '🎞️' },
    { id: 'promo', name: 'ترويج', icon: '🎉' },
    { id: 'social', name: 'وسائط اجتماعية', icon: '📱' },
  ];

  const templates = selectedCategory === 'all' 
    ? getAllTemplates.data?.templates || [] 
    : getTemplatesByCategory.data?.templates || [];

  const filteredTemplates = templates.filter((template: any) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUseTemplate = (template: any) => {
    setSelectedTemplate(template);
  };

  const handleCreateProject = () => {
    if (selectedTemplate) {
      // Navigate to project creation with template
      window.location.href = `/editor?templateId=${selectedTemplate.id}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              📚 مكتبة القوالب
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-2">
            اختر من مئات القوالب الجاهزة لتسريع إنشاء الفيديوهات
          </p>
          <p className="text-sm text-slate-400">
            قوالب احترافية مصممة للتسويق والتعليم والترويج والمزيد
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="ابحث عن قالب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSelectedTemplate(null);
              }}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Templates Grid */}
        <div className="lg:col-span-2">
          {(getAllTemplates.isLoading || getTemplatesByCategory.isLoading) ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center text-slate-400 py-12">
              <p className="text-lg">لم يتم العثور على قوالب</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTemplates.map((template: any) => (
                <Card
                  key={template.id}
                  onClick={() => handleUseTemplate(template)}
                  className={`bg-slate-800/50 border-slate-700 overflow-hidden cursor-pointer transition-all hover:border-cyan-500/50 ${
                    selectedTemplate?.id === template.id
                      ? 'border-cyan-500 ring-2 ring-cyan-500/20'
                      : ''
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative h-40 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center overflow-hidden group">
                    {template.thumbnail ? (
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <div className="text-center">
                        <Play className="w-12 h-12 text-cyan-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">معاينة</p>
                      </div>
                    )}
                    
                    {/* Duration Badge */}
                    <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs">
                      {Math.floor(template.duration / 60)}:{String(template.duration % 60).padStart(2, '0')}
                    </div>

                    {/* Difficulty Badge */}
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${
                      template.difficulty === 'easy'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : template.difficulty === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {template.difficulty === 'easy' ? 'سهل' : template.difficulty === 'medium' ? 'متوسط' : 'متقدم'}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{template.name}</h3>
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                      {template.description || 'قالب احترافي جاهز للاستخدام'}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span>{template.usageCount || 0} استخدام</span>
                      </div>
                      <span className="px-2 py-1 bg-slate-700 rounded">
                        {template.category}
                      </span>
                    </div>

                    {/* Tags */}
                    {template.tags && (
                      <div className="flex gap-1 flex-wrap mb-4">
                        {JSON.parse(template.tags || '[]').slice(0, 3).map((tag: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <Button
                      onClick={() => handleUseTemplate(template)}
                      variant={selectedTemplate?.id === template.id ? 'default' : 'outline'}
                      className="w-full"
                    >
                      {selectedTemplate?.id === template.id ? '✓ مختار' : 'اختيار'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Template Preview Sidebar */}
        <div className="lg:col-span-1">
          {selectedTemplate ? (
            <Card className="bg-slate-800/50 border-slate-700 p-6 sticky top-8">
              <h2 className="text-2xl font-bold mb-4">{selectedTemplate.name}</h2>

              {/* Preview */}
              <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg h-40 flex items-center justify-center mb-6">
                {selectedTemplate.thumbnail ? (
                  <img
                    src={selectedTemplate.thumbnail}
                    alt={selectedTemplate.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Play className="w-12 h-12 text-cyan-400" />
                )}
              </div>

              {/* Details */}
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-slate-400 mb-1">الوصف</p>
                  <p className="text-white">{selectedTemplate.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">المدة</p>
                    <p className="text-white font-semibold">
                      {Math.floor(selectedTemplate.duration / 60)}:{String(selectedTemplate.duration % 60).padStart(2, '0')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">المستوى</p>
                    <p className="text-white font-semibold capitalize">
                      {selectedTemplate.difficulty === 'easy' ? 'سهل' : selectedTemplate.difficulty === 'medium' ? 'متوسط' : 'متقدم'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-slate-400 mb-1">الفئة</p>
                  <p className="text-white capitalize">{selectedTemplate.category}</p>
                </div>

                {selectedTemplate.tags && (
                  <div>
                    <p className="text-sm text-slate-400 mb-2">الوسوم</p>
                    <div className="flex gap-2 flex-wrap">
                      {JSON.parse(selectedTemplate.tags || '[]').map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-xs bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleCreateProject}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-2 rounded-lg transition-all"
                >
                  <Download className="w-4 h-4 mr-2" />
                  استخدم هذا القالب
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSelectedTemplate(null)}
                >
                  إلغاء الاختيار
                </Button>
              </div>

              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">عدد الاستخدامات</span>
                  <span className="text-white font-semibold">{selectedTemplate.usageCount || 0}</span>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="bg-slate-800/50 border-slate-700 p-6 text-center">
              <Play className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">اختر قالباً من القائمة لعرض التفاصيل</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
