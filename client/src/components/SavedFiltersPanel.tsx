import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Trash2,
  Save,
  Upload,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useFilterPreferences, SavedFilter } from '@/hooks/useFilterPreferences';
import { FilterOptions } from './AdvancedFilters';

interface SavedFiltersPanelProps {
  currentFilters: FilterOptions;
  onLoadFilter: (filters: FilterOptions) => void;
}

export default function SavedFiltersPanel({
  currentFilters,
  onLoadFilter,
}: SavedFiltersPanelProps) {
  const {
    savedFilters,
    saveFilterSet,
    loadFilterSet,
    deleteFilterSet,
    updateFilterSetName,
  } = useFilterPreferences();

  const [isOpen, setIsOpen] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleSaveFilter = () => {
    if (!newFilterName.trim()) {
      toast.error('يرجى إدخال اسم للفلتر');
      return;
    }

    const id = saveFilterSet(newFilterName, currentFilters);
    if (id) {
      toast.success(`تم حفظ الفلتر "${newFilterName}" بنجاح`);
      setNewFilterName('');
    } else {
      toast.error('حدث خطأ أثناء حفظ الفلتر');
    }
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    onLoadFilter(filter.filters);
    toast.success(`تم تحميل الفلتر "${filter.name}"`);
    setIsOpen(false);
  };

  const handleDeleteFilter = (id: string) => {
    deleteFilterSet(id);
    toast.success('تم حذف الفلتر بنجاح');
  };

  const handleUpdateName = (id: string) => {
    if (!editingName.trim()) {
      toast.error('يرجى إدخال اسم للفلتر');
      return;
    }

    updateFilterSetName(id, editingName);
    toast.success('تم تحديث اسم الفلتر');
    setEditingId(null);
    setEditingName('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Save className="w-4 h-4" />
          إدارة الفلاتر المحفوظة
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">إدارة الفلاتر المحفوظة</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* حفظ فلتر جديد */}
          <div className="space-y-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <h3 className="font-semibold text-slate-200">حفظ الفلتر الحالي</h3>
            <div className="flex gap-2">
              <Input
                placeholder="أدخل اسم الفلتر..."
                value={newFilterName}
                onChange={(e) => setNewFilterName(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveFilter();
                  }
                }}
              />
              <Button
                onClick={handleSaveFilter}
                className="bg-cyan-500 hover:bg-cyan-600 gap-2"
              >
                <Save className="w-4 h-4" />
                حفظ
              </Button>
            </div>
          </div>

          {/* قائمة الفلاتر المحفوظة */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-200">
              الفلاتر المحفوظة ({savedFilters.length})
            </h3>

            {savedFilters.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>لم تقم بحفظ أي فلاتر بعد</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {savedFilters.map((filter) => (
                  <Card
                    key={filter.id}
                    className="p-3 bg-slate-800 border-slate-700 hover:border-cyan-500/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {editingId === filter.id ? (
                          <div className="flex gap-2">
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white text-sm"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={() => handleUpdateName(filter.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingId(null)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium text-slate-100 truncate">
                              {filter.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {new Date(filter.createdAt).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                        )}
                      </div>

                      {editingId !== filter.id && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleLoadFilter(filter)}
                            className="gap-1"
                          >
                            <Upload className="w-3 h-3" />
                            تحميل
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(filter.id);
                              setEditingName(filter.name);
                            }}
                            className="gap-1"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteFilter(filter.id)}
                            className="gap-1 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
