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
import { Card } from "@/components/ui/shadcn/card";
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
      <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="animate-pulse space-y-4 p-6 md:p-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-slate-100" />
          ))}
        </div>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm md:p-8">
        <p className="font-medium text-slate-900">Нет транзакций</p>
        <p className="mt-1 text-sm text-slate-500">
          Создайте первую транзакцию, чтобы начать учёт
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 hover:bg-transparent">
              <TableHead className="h-12 px-6 font-semibold text-slate-500">
                Дата
              </TableHead>
              <TableHead className="font-semibold text-slate-500">Тип</TableHead>
              <TableHead className="font-semibold text-slate-500">
                Категория
              </TableHead>
              <TableHead className="font-semibold text-slate-500">
                Описание
              </TableHead>
              <TableHead className="text-right font-semibold text-slate-500">
                Сумма
              </TableHead>
              <TableHead className="w-[100px] text-right font-semibold text-slate-500">
                Действия
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => {
              const isIncome = transaction.type === "income";
              return (
                <TableRow
                  key={transaction.id}
                  className="border-slate-200 transition-colors hover:bg-slate-50/80"
                >
                  <TableCell className="px-6 py-4 font-medium text-slate-600">
                    {formatDate(transaction.transactionDate)}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span
                      className={
                        isIncome
                          ? "font-medium text-[#10B981]"
                          : "font-medium text-slate-700"
                      }
                    >
                      {isIncome ? "Доход" : "Расход"}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-slate-700">
                    {transaction.categoryId}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate px-6 py-4 text-slate-500">
                    {transaction.description || "—"}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right font-semibold">
                    <span
                      className={
                        isIncome ? "text-[#10B981]" : "text-slate-900"
                      }
                    >
                      {isIncome ? "+" : "−"}
                      {formatCurrency(
                        Number(transaction.amount),
                        transaction.currency
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        onClick={() => onEdit(transaction)}
                        aria-label="Редактировать"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl text-slate-500 hover:bg-red-50 hover:text-destructive"
                        onClick={() => onDelete(transaction.id)}
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
      </Card>

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
