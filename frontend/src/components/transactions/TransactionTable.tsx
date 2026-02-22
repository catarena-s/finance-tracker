"use client";

import React from "react";
import { Transaction } from "@/types/api";
import { formatCurrency, formatDate } from "@/utils/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/shadcn/table";
import { Button } from "@/components/ui/shadcn/button";
import { Pagination } from "@/components/ui/Pagination";
import { Pencil, Trash2 } from "lucide-react";

interface TransactionTableProps {
  transactions: Transaction[];
  loading?: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionTable({
  transactions,
  loading = false,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onEdit,
  onDelete,
}: TransactionTableProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card">
        <div className="animate-pulse p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground font-medium">Нет транзакций</p>
        <p className="text-sm text-muted-foreground mt-1">
          Создайте первую транзакцию, чтобы начать учёт
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-fintech">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[140px]">Дата</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead>Описание</TableHead>
              <TableHead className="text-right">Сумма</TableHead>
              <TableHead className="w-[100px] text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => {
              const isIncome = transaction.type === "income";
              return (
                <TableRow key={transaction.id}>
                  <TableCell className="text-muted-foreground font-medium">
                    {formatDate(transaction.transactionDate)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        isIncome
                          ? "text-secondary font-medium"
                          : "text-destructive font-medium"
                      }
                    >
                      {isIncome ? "Доход" : "Расход"}
                    </span>
                  </TableCell>
                  <TableCell>{transaction.categoryId}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    {transaction.description || "—"}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    <span className={isIncome ? "text-secondary" : "text-destructive"}>
                      {isIncome ? "+" : "−"}
                      {formatCurrency(Number(transaction.amount), transaction.currency)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(transaction)}
                        aria-label="Редактировать"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(transaction.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        aria-label="Удалить"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
