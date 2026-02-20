"use client";

import React, { useEffect, useState } from "react";
import { recurringTransactionsApi } from "@/services/api";
import type { RecurringTransaction } from "@/types/api";
import Link from "next/link";

export default function RecurringPage() {
  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    recurringTransactionsApi
      .getAll()
      .then(setItems)
      .catch((e) => setError(e?.message ?? "Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-gray-600">Загрузка...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Повторяющиеся транзакции
        </h1>
        <Link
          href="/transactions"
          className="text-blue-600 hover:underline text-sm"
        >
          К транзакциям
        </Link>
      </div>
      <p className="text-gray-600 mb-4">
        Шаблоны для автоматического создания транзакций (подписки, зарплата и
        т.д.).
      </p>
      {items.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          Нет шаблонов. Создайте шаблон через API (POST
          /api/v1/recurring-transactions/).
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((r) => (
            <li
              key={r.id}
              className="bg-white rounded-lg shadow p-4 flex justify-between items-center"
            >
              <div>
                <span className="font-medium">{r.name}</span>
                <span className="text-gray-500 ml-2">
                  {r.amount} {r.currency} · {r.frequency}
                </span>
              </div>
              <span
                className={`text-sm ${
                  r.isActive ? "text-green-600" : "text-gray-400"
                }`}
              >
                {r.isActive ? "Активен" : "Неактивен"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
