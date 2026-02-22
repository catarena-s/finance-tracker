"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Category } from "@/types/api";
import { CategoryList, CategoryForm } from "@/components/categories";
import { Modal, Button } from "@/components/ui";

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
  }, [loadCategories]);

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
    const category = categories?.find((c) => c.id === id);
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
    <div className="min-h-full bg-[#F8FAFC]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
            Категории
          </h1>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Добавить категорию
          </Button>
        </div>

        {error && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-4 py-3 shadow-sm">
            <span className="text-red-700">{error}</span>
            <button
              onClick={clearError}
              className="rounded-2xl p-1 text-red-600 hover:text-red-800"
              aria-label="Закрыть"
            >
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
            <p className="text-slate-700">
              Вы уверены, что хотите удалить эту категорию?
            </p>
            {selectedCategory && (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                <span className="text-2xl">{selectedCategory.icon ?? "📁"}</span>
                <div>
                  <p className="font-medium text-slate-900">
                    {selectedCategory.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {selectedCategory.type === "income" ? "Доход" : "Расход"}
                  </p>
                </div>
              </div>
            )}
            <p className="text-sm text-amber-600">
              ⚠️ Внимание: Если у категории есть связанные транзакции, удаление будет
              невозможно.
            </p>
            <div className="flex gap-3">
              <Button variant="danger" onClick={handleDeleteConfirm} className="flex-1">
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
