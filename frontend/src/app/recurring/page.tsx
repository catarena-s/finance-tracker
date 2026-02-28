"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { recurringTransactionsApi } from "@/services/api";
import { useApp } from "@/contexts/AppContext";
import type { RecurringTransaction, RecurringTransactionCreate } from "@/types/api";
import {
  RecurringTransactionList,
  RecurringTransactionForm,
} from "@/components/recurring";
import { Modal, Button } from "@/components/ui";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { X } from "lucide-react";

function RecurringPageContent() {
  const { categories, loadCategories } = useApp();
  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selected, setSelected] = useState<RecurringTransaction | null>(null);
  const searchParams = useSearchParams();

  const load = useCallback(() => {
    setLoading(true);
    recurringTransactionsApi
      .getAll()
      .then(setItems)
      .catch((e) => setError(e?.message ?? "Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadCategories();
    load();
  }, [loadCategories, load]);

  useEffect(() => {
    if (searchParams.get("openAdd") === "1" && !isCreateModalOpen) {
      setIsCreateModalOpen(true);
      // Очищаем query параметр после открытия
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams, isCreateModalOpen]);

  const handleCreate = async (data: RecurringTransactionCreate) => {
    await recurringTransactionsApi.create(data);
    setIsCreateModalOpen(false);
    load();
  };

  const handleEdit = (item: RecurringTransaction) => {
    setSelected(item);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (data: RecurringTransactionCreate) => {
    if (!selected) return;
    await recurringTransactionsApi.update(selected.id, data);
    setIsEditModalOpen(false);
    setSelected(null);
    load();
  };

  const handleDeleteClick = (item: RecurringTransaction) => {
    setSelected(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selected) return;
    await recurringTransactionsApi.delete(selected.id);
    setIsDeleteModalOpen(false);
    setSelected(null);
    load();
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await recurringTransactionsApi.update(id, { isActive });
    load();
  };

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground md:text-3xl mb-2">
              Повторяющиеся транзакции
            </h1>
            <p className="text-muted-foreground">
              Шаблоны для автоматического создания транзакций (подписки, зарплата и т.д.).
            </p>
          </div>
        </div>

        {error && (
          <Card className="mb-6 rounded-2xl border-destructive/50 bg-destructive/10 shadow-sm">
            <CardContent className="flex flex-row items-center justify-between py-4">
              <span className="text-destructive">{error}</span>
              <button
                type="button"
                onClick={() => setError(null)}
                className="rounded-2xl p-1 text-destructive hover:text-destructive/80"
                aria-label="Закрыть"
              >
                <X className="h-5 w-5" />
              </button>
            </CardContent>
          </Card>
        )}

        {loading && items.length === 0 && (
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Загрузка...</p>
            </CardContent>
          </Card>
        )}

        {(!loading || items.length > 0) && (
          <RecurringTransactionList
            items={items}
            onEdit={handleEdit}
            onDelete={(id) => {
              const item = items.find((r) => r.id === id);
              if (item) handleDeleteClick(item);
            }}
            onToggleActive={handleToggleActive}
          />
        )}

        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Создать шаблон"
        >
          <RecurringTransactionForm
            categories={categories ?? []}
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </Modal>

        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelected(null);
          }}
          title="Редактировать шаблон"
        >
          {selected && (
            <RecurringTransactionForm
              item={selected}
              categories={categories ?? []}
              onSubmit={handleUpdate}
              onCancel={() => {
                setIsEditModalOpen(false);
                setSelected(null);
              }}
            />
          )}
        </Modal>

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelected(null);
          }}
          title="Удалить шаблон"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-foreground">
              Удалить шаблон &quot;{selected?.name}&quot;? Созданные транзакции
              сохранятся.
            </p>
            <div className="flex gap-3">
              <Button variant="danger" onClick={handleDeleteConfirm} className="flex-1">
                Удалить
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelected(null);
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

export default function RecurringPage() {
  return (
    <Suspense
      fallback={<div className="min-h-full bg-background p-8">Загрузка...</div>}
    >
      <RecurringPageContent />
    </Suspense>
  );
}
