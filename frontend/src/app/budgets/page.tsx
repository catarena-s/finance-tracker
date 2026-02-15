"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Budget } from "@/types/api";
import { BudgetList, BudgetForm } from "@/components/budgets";
import { Modal, Button } from "@/components/ui";

export default function BudgetsPage() {
  const {
    budgets,
    categories,
    loading,
    error,
    loadBudgets,
    loadCategories,
    createBudget,
    updateBudget,
    deleteBudget,
    clearError,
  } = useApp();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [budgetProgress, setBudgetProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    loadCategories();
    loadBudgets();
  }, []);

  // TODO: Load actual budget progress from analytics API
  useEffect(() => {
    if (!budgets) return;

    // Mock budget progress for now
    const progress: Record<string, number> = {};
    budgets.forEach((budget) => {
      progress[budget.id] = Math.random() * Number(budget.amount);
    });
    setBudgetProgress(progress);
  }, [budgets]);

  const handleCreate = async (data: any) => {
    try {
      await createBudget(data);
      setIsCreateModalOpen(false);
    } catch (err) {
      // Error is handled in context
    }
  };

  const handleEdit = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (data: any) => {
    if (!selectedBudget) return;
    try {
      await updateBudget(selectedBudget.id, data);
      setIsEditModalOpen(false);
      setSelectedBudget(null);
    } catch (err) {
      // Error is handled in context
    }
  };

  const handleDeleteClick = (id: string) => {
    const budget = budgets?.find((b) => b.id === id);
    if (budget) {
      setSelectedBudget(budget);
      setIsDeleteModalOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBudget) return;
    try {
      await deleteBudget(selectedBudget.id);
      setIsDeleteModalOpen(false);
      setSelectedBudget(null);
    } catch (err) {
      // Error is handled in context
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Бюджеты</h1>
          <Button onClick={() => setIsCreateModalOpen(true)}>Добавить бюджет</Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={clearError} className="text-red-600 hover:text-red-800">
              ✕
            </button>
          </div>
        )}

        <BudgetList
          budgets={budgets}
          budgetProgress={budgetProgress}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />

        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Создать бюджет"
        >
          <BudgetForm
            categories={categories}
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </Modal>

        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedBudget(null);
          }}
          title="Редактировать бюджет"
        >
          {selectedBudget && (
            <BudgetForm
              budget={selectedBudget}
              categories={categories}
              onSubmit={handleUpdate}
              onCancel={() => {
                setIsEditModalOpen(false);
                setSelectedBudget(null);
              }}
            />
          )}
        </Modal>

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedBudget(null);
          }}
          title="Удалить бюджет"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-700">Вы уверены, что хотите удалить этот бюджет?</p>
            {selectedBudget && (
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium">{selectedBudget.amount} USD</p>
                <p className="text-sm text-gray-600">
                  {selectedBudget.period === "monthly" ? "Месячный" : "Годовой"}
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="danger" onClick={handleDeleteConfirm} className="flex-1">
                Удалить
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedBudget(null);
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
