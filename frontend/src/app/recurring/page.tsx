"use client";

import React, { useEffect, useState } from "react";
import { recurringTransactionsApi } from "@/services/api";
import { useApp } from "@/contexts/AppContext";
import type { RecurringTransaction, RecurringTransactionCreate } from "@/types/api";
import {
  RecurringTransactionList,
  RecurringTransactionForm,
} from "@/components/recurring";
import { Modal, Button } from "@/components/ui";
import Link from "next/link";

export default function RecurringPage() {
  const { categories, loadCategories } = useApp();
  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selected, setSelected] = useState<RecurringTransaction | null>(null);

  const load = () => {
    setLoading(true);
    recurringTransactionsApi
      .getAll()
      .then(setItems)
      .catch((e) => setError(e?.message ?? "Ошибка загрузки"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
    load();
  }, []);

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
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Повторяющиеся транзакции</h1>
        <div className="flex gap-2">
          <Link
            href="/transactions"
            className="text-blue-600 hover:underline text-sm self-center"
          >
            К транзакциям
          </Link>
          <Button onClick={() => setIsCreateModalOpen(true)}>Добавить шаблон</Button>
        </div>
      </div>
      <p className="text-gray-600 mb-4">
        Шаблоны для автоматического создания транзакций (подписки, зарплата и т.д.).
      </p>

      {loading && items.length === 0 && <p className="text-gray-600">Загрузка...</p>}

      {error && (
        <div className="bg-red-50 text-red-800 px-4 py-2 rounded mb-4">{error}</div>
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
        size="lg"
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
        size="lg"
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
          <p className="text-gray-700">
            Удалить шаблон &quot;{selected?.name}&quot;? Созданные транзакции
            сохранятся.
          </p>
          <div className="flex gap-2">
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Удалить
            </Button>
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Отмена
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
