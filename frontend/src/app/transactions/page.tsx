"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Transaction } from "@/types/api";
import {
  TransactionList,
  TransactionFilters,
  TransactionForm,
  TransactionFilterValues,
} from "@/components/transactions";
import { Modal, Button } from "@/components/ui";

export default function TransactionsPage() {
  const {
    transactions,
    categories,
    loading,
    error,
    loadTransactions,
    loadCategories,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    clearError,
  } = useApp();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<TransactionFilterValues>({});
  const pageSize = 10;

  useEffect(() => {
    loadCategories();
    loadTransactions({ page: currentPage, pageSize, ...filters });
  }, [currentPage, filters]);

  const handleFilterChange = (newFilters: TransactionFilterValues) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleCreate = async (data: any) => {
    try {
      await createTransaction(data);
      setIsCreateModalOpen(false);
    } catch (err) {
      // Error is handled in context
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (data: any) => {
    if (!selectedTransaction) return;
    try {
      await updateTransaction(selectedTransaction.id, data);
      setIsEditModalOpen(false);
      setSelectedTransaction(null);
    } catch (err) {
      // Error is handled in context
    }
  };

  const handleDeleteClick = (id: string) => {
    const transaction = transactions?.find((t) => t.id === id);
    if (transaction) {
      setSelectedTransaction(transaction);
      setIsDeleteModalOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTransaction) return;
    try {
      await deleteTransaction(selectedTransaction.id);
      setIsDeleteModalOpen(false);
      setSelectedTransaction(null);
    } catch (err) {
      // Error is handled in context
    }
  };

  const totalPages = Math.ceil((transactions?.length || 0) / pageSize);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Транзакции</h1>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Добавить транзакцию
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

        <TransactionFilters
          categories={categories}
          onFilterChange={handleFilterChange}
        />

        <TransactionList
          transactions={transactions}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={transactions?.length || 0}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />

        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Создать транзакцию"
        >
          <TransactionForm
            categories={categories}
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </Modal>

        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedTransaction(null);
          }}
          title="Редактировать транзакцию"
        >
          {selectedTransaction && (
            <TransactionForm
              transaction={selectedTransaction}
              categories={categories}
              onSubmit={handleUpdate}
              onCancel={() => {
                setIsEditModalOpen(false);
                setSelectedTransaction(null);
              }}
            />
          )}
        </Modal>

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedTransaction(null);
          }}
          title="Удалить транзакцию"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Вы уверены, что хотите удалить эту транзакцию?
            </p>
            {selectedTransaction && (
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium">
                  {selectedTransaction.amount} {selectedTransaction.currency}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedTransaction.description}
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
                  setSelectedTransaction(null);
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
