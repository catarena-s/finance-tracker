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
      <Card className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="animate-pulse space-y-4 p-6 md:p-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-muted" />
          ))}
        </div>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm md:p-8">
        <p className="font-medium text-foreground">Нет транзакций</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Создайте первую транзакцию, чтобы начать учёт
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-[box-shadow] hover:shadow-md">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="h-12 w-[100px] px-2 font-semibold text-muted-foreground md:w-[120px] md:px-4">
                Дата
              </TableHead>
              <TableHead className="hidden w-[80px] px-2 font-semibold text-muted-foreground lg:table-cell md:px-4">Тип</TableHead>
              <TableHead className="w-[120px] px-2 font-semibold text-muted-foreground md:w-[140px] md:px-4">
                Категория
              </TableHead>
              <TableHead className="hidden px-2 font-semibold text-muted-foreground xl:table-cell md:px-4">
                Описание
              </TableHead>
              <TableHead className="min-w-[120px] px-2 text-right font-semibold text-muted-foreground md:px-4">
                Сумма
              </TableHead>
              <TableHead className="w-[80px] px-1 text-right font-semibold text-muted-foreground md:w-[100px] md:px-2">
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
                  className="border-border transition-[background-color] hover:bg-muted/50"
                >
                  <TableCell className="px-2 py-3 text-xs font-medium text-muted-foreground md:px-4 md:text-sm">
                    {formatDate(transaction.transactionDate)}
                  </TableCell>
                  <TableCell className="hidden px-2 py-3 lg:table-cell md:px-4">
                    <span
                      className={
                        isIncome
                          ? "text-xs font-medium text-secondary md:text-sm"
                          : "text-xs font-medium text-foreground md:text-sm"
                      }
                    >
                      {isIncome ? "Доход" : "Расход"}
                    </span>
                  </TableCell>
                  <TableCell className="px-2 py-3 text-xs text-foreground md:px-4 md:text-sm">
                    {(transaction as any).category?.name || transaction.categoryId}
                  </TableCell>
                  <TableCell className="hidden max-w-[200px] truncate px-2 py-3 text-xs text-muted-foreground xl:table-cell md:px-4 md:text-sm">
                    {transaction.description || "—"}
                  </TableCell>
                  <TableCell className="px-2 py-3 text-right text-xs font-semibold md:px-4 md:text-sm">
                    <span className={isIncome ? "text-secondary" : "text-foreground"}>
                      {isIncome ? "+" : "−"}
                      {formatCurrency(Number(transaction.amount), transaction.currency)}
                    </span>
                  </TableCell>
                  <TableCell className="px-1 py-3 text-right md:px-2">
                    <div className="flex justify-end gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl text-muted-foreground transition-[background-color,color] duration-200 hover:bg-muted hover:text-foreground"
                        onClick={() => onEdit(transaction)}
                        aria-label="Редактировать"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl text-muted-foreground transition-[background-color,color] duration-200 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => onDelete(transaction.id)}
                        aria-label="Удалить"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
