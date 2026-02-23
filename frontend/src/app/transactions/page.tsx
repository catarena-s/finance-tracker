"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { Transaction } from "@/types/api";
import {
  TransactionTable,
  TransactionFilters,
  TransactionForm,
  TransactionFilterValues,
} from "@/components/transactions";
import { CSVImportForm, CSVExportDialog } from "@/components/csv";
import { Modal, Button } from "@/components/ui";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { X } from "lucide-react";

function TransactionsPageContent() {
  const {
    transactions,
    transactionsPagination,
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

  // Инициализируем фильтры с датами по умолчанию
  const getDefaultFilters = (): TransactionFilterValues => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    return {
      startDate: formatDate(firstDayOfMonth),
      endDate: formatDate(today),
    };
  };

  const [filters, setFilters] = useState<TransactionFilterValues>(getDefaultFilters());
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [csvExportOpen, setCsvExportOpen] = useState(false);
  const pageSize = 10;
  const searchParams = useSearchParams();

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (searchParams.get("openAdd") === "1") {
      setIsCreateModalOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      await loadTransactions({ page: currentPage, pageSize, ...filters });
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters]);

  const handleFilterChange = (newFilters: TransactionFilterValues) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleCreate = async (data: any) => {
    try {
      await createTransaction(data);
      setIsCreateModalOpen(false);
    } catch {
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
    } catch {
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
    } catch {
      // Error is handled in context
    }
  };

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
            Транзакции
          </h1>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setCsvImportOpen(true)}>
              Импорт CSV
            </Button>
            <Button variant="secondary" onClick={() => setCsvExportOpen(true)}>
              Экспорт CSV
            </Button>
          </div>
        </div>

        <Modal
          isOpen={csvImportOpen}
          onClose={() => setCsvImportOpen(false)}
          title="Импорт из CSV"
          size="xl"
        >
          <CSVImportForm />
        </Modal>

        <CSVExportDialog
          isOpen={csvExportOpen}
          onClose={() => setCsvExportOpen(false)}
          categories={categories}
        />

        {error && (
          <Card className="mb-6 rounded-2xl border-destructive/50 bg-destructive/10 shadow-sm">
            <CardContent className="flex flex-row items-center justify-between py-4">
              <span className="text-destructive">{error}</span>
              <button
                type="button"
                onClick={clearError}
                className="rounded-2xl p-1 text-destructive hover:text-destructive/80"
                aria-label="Закрыть"
              >
                <X className="h-5 w-5" />
              </button>
            </CardContent>
          </Card>
        )}

        <TransactionFilters
          categories={categories}
          onFilterChange={handleFilterChange}
        />

        <TransactionTable
          transactions={transactions ?? []}
          loading={loading}
          currentPage={currentPage}
          totalPages={transactionsPagination?.totalPages ?? 1}
          totalItems={transactionsPagination?.totalItems ?? 0}
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
            <p className="text-foreground">
              Вы уверены, что хотите удалить эту транзакцию?
            </p>
            {selectedTransaction && (
              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <p className="font-semibold text-foreground">
                  {selectedTransaction.amount} {selectedTransaction.currency}
                </p>
                <p className="text-sm text-muted-foreground">
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

export default function TransactionsPage() {
  return (
    <Suspense
      fallback={<div className="min-h-full bg-background p-8">Загрузка...</div>}
    >
      <TransactionsPageContent />
    </Suspense>
  );
}
