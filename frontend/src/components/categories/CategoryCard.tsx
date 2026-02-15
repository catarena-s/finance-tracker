import React from 'react';
import { Category } from '@/types/api';
import { Button } from '@/components/ui';

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const typeLabel = category.type === 'income' ? 'Доход' : 'Расход';
  const typeBadgeColor = category.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${category.color}20` }}
            aria-label="Category icon"
          >
            {category.icon}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {category.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${typeBadgeColor}`}>
                {typeLabel}
              </span>
              <div
                className="w-4 h-4 rounded border border-gray-300"
                style={{ backgroundColor: category.color }}
                title={`Color: ${category.color}`}
                aria-label={`Category color: ${category.color}`}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(category)}
            aria-label="Edit category"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(category.id)}
            aria-label="Delete category"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
