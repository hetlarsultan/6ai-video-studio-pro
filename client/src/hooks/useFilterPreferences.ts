import { useState, useEffect, useCallback } from 'react';
import { FilterOptions } from '@/components/AdvancedFilters';

const STORAGE_KEY = 'media-library-filter-preferences';
const SAVED_FILTERS_KEY = 'media-library-saved-filters';

export interface SavedFilter {
  id: string;
  name: string;
  filters: FilterOptions;
  createdAt: string;
}

export function useFilterPreferences() {
  const [preferences, setPreferences] = useState<FilterOptions | null>(null);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // تحميل التفضيلات من localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPreferences(JSON.parse(stored));
      }

      const storedFilters = localStorage.getItem(SAVED_FILTERS_KEY);
      if (storedFilters) {
        setSavedFilters(JSON.parse(storedFilters));
      }
    } catch (error) {
      console.error('Error loading filter preferences:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // حفظ التفضيلات
  const savePreferences = useCallback((filters: FilterOptions) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
      setPreferences(filters);
    } catch (error) {
      console.error('Error saving filter preferences:', error);
    }
  }, []);

  // إعادة تعيين التفضيلات
  const resetPreferences = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setPreferences(null);
    } catch (error) {
      console.error('Error resetting filter preferences:', error);
    }
  }, []);

  // حفظ مجموعة فلاتر جديدة
  const saveFilterSet = useCallback((name: string, filters: FilterOptions) => {
    try {
      const newFilter: SavedFilter = {
        id: Date.now().toString(),
        name,
        filters,
        createdAt: new Date().toISOString(),
      };

      const updated = [...savedFilters, newFilter];
      localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));
      setSavedFilters(updated);
      return newFilter.id;
    } catch (error) {
      console.error('Error saving filter set:', error);
      return null;
    }
  }, [savedFilters]);

  // تحميل مجموعة فلاتر محفوظة
  const loadFilterSet = useCallback((id: string) => {
    const filter = savedFilters.find((f) => f.id === id);
    if (filter) {
      savePreferences(filter.filters);
      return filter.filters;
    }
    return null;
  }, [savedFilters, savePreferences]);

  // حذف مجموعة فلاتر محفوظة
  const deleteFilterSet = useCallback((id: string) => {
    try {
      const updated = savedFilters.filter((f) => f.id !== id);
      localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));
      setSavedFilters(updated);
    } catch (error) {
      console.error('Error deleting filter set:', error);
    }
  }, [savedFilters]);

  // تحديث اسم مجموعة فلاتر
  const updateFilterSetName = useCallback(
    (id: string, newName: string) => {
      try {
        const updated = savedFilters.map((f) =>
          f.id === id ? { ...f, name: newName } : f
        );
        localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));
        setSavedFilters(updated);
      } catch (error) {
        console.error('Error updating filter set name:', error);
      }
    },
    [savedFilters]
  );

  return {
    preferences,
    savedFilters,
    isLoaded,
    savePreferences,
    resetPreferences,
    saveFilterSet,
    loadFilterSet,
    deleteFilterSet,
    updateFilterSetName,
  };
}
