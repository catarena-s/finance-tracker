'use client';

import dynamic from 'next/dynamic';
import { Spinner } from '@/components/ui';

// Динамический импорт тяжелых компонентов с графиками
export const ExpenseChart = dynamic(
  () => import('./ExpenseChart').then((mod) => mod.ExpenseChart),
  {
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    ),
    ssr: false, // Отключаем SSR для графиков
  }
);

export const TrendChart = dynamic(
  () => import('./TrendChart').then((mod) => mod.TrendChart),
  {
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    ),
    ssr: false,
  }
);

export const TopCategoriesWidget = dynamic(
  () => import('./TopCategoriesWidget').then((mod) => mod.TopCategoriesWidget),
  {
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    ),
    ssr: false,
  }
);
