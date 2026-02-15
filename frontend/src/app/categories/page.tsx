'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Category } from '@/types/api';
import { CategoryList, CategoryForm } from '@/components/categories';
import { Modal, Button } from '@/components/ui';

export default function CategoriesPage() {
  const {
    categories,
    loading,
    error,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    clearError,
  } = useApp();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (data: any) => {
    try {
      await createCategory(data);
      setIsCreateModalOpen(false);
    } catch (err) {
      // Error is handled in context
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (data: any) => {
    if (!selectedCategory) return;
    try {
      await updateCategory(selectedCategory.id, data);
      setIsEditModalOpen(false);
      setSelectedCategory(null);
    } catch (err) {
      // Error is handled in context
    }
  };

  const handleDeleteClick = (id: string) => {
    const category = categories.find((c) => c.id === id);
    if (category) {
      setSelectedCategory(category);
      setIsDeleteModalOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return;
    try {
      await deleteCategory(selectedCategory.id);
      setIsDeleteModalOpen(false);
      setSelectedCategory(null);
    } catch (err) {
      // Error is handled in context
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Категории</h1>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Добавить категорию
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={clearError} className="text-red-600 hover:text-red-800">
              ✕
            </button>
          </div>
        )}

        <CategoryList
          categories={categories}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />

        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Создать категорию"
        >
          <CategoryForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </Modal>

        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCategory(null);
          }}
          title="Редактировать категорию"
        >
          {selectedCategory && (
            <CategoryForm
              category={selectedCategory}
              onSubmit={handleUpdate}
              onCancel={() => {
                setIsEditModalOpen(false);
                setSelectedCategory(null);
              }}
            />
          )}
        </Modal>

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedCategory(null);
          }}
          title="Удалить категорию"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Вы уверены, что хотите удалить эту категорию?
            </p>
            {selectedCategory && (
              <div className="bg-gray-50 p-3 rounded flex items-center gap-3">
                <span className="text-2xl">{selectedCategory.icon}</span>
                <div>
                  <p className="font-medium">{selectedCategory.name}</p>
                  <p className="text-sm text-gray-600">
                    {selectedCategory.type === 'income' ? 'Доход' : 'Расход'}
                  </p>
                </div>
              </div>
            )}
            <p className="text-sm text-amber-600">
              ⚠️ Внимание: Если у категории есть связанные транзакции, удаление будет невозможно.
            </p>
            <div className="flex gap-3">
              <Button
                variant="danger"
                onClick={handleDeleteConfirm}
                className="flex-1"
              >
                Удалить
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedCategory(null);
                }}
                className="flex-1"
              >
                Отмена
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
