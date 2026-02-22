"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { ArrowLeftRight, FolderTree, PiggyBank, Check } from "lucide-react";

const linkButtonClass =
  "inline-flex items-center justify-center rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 hover:shadow-md";

export default function HomePage() {
  return (
    <div className="min-h-full bg-[#F8FAFC]">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-slate-900 sm:text-5xl">
            Трекер личных финансов
          </h1>
          <p className="mb-12 text-xl text-slate-500">
            Управляйте своими финансами легко и прозрачно
          </p>

          <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="p-6 md:p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <ArrowLeftRight className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                  Транзакции
                </h3>
                <p className="mb-4 text-slate-500">Учёт доходов и расходов</p>
                <Link href="/transactions" className={linkButtonClass}>
                  Перейти
                </Link>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="p-6 md:p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <FolderTree className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">Категории</h3>
                <p className="mb-4 text-slate-500">Организуйте учёт по категориям</p>
                <Link href="/categories" className={linkButtonClass}>
                  Перейти
                </Link>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="p-6 md:p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <PiggyBank className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">Бюджеты</h3>
                <p className="mb-4 text-slate-500">Контроль лимитов расходов</p>
                <Link href="/budgets" className={linkButtonClass}>
                  Перейти
                </Link>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl border border-slate-200 bg-white text-left shadow-sm">
            <CardContent className="p-6 md:p-8">
              <h2 className="mb-6 text-lg font-semibold text-slate-900">Возможности</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  {
                    title: "Учёт транзакций",
                    desc: "Добавляйте доходы и расходы с описанием и категорией",
                  },
                  {
                    title: "Категории",
                    desc: "Создавайте категории с иконками для удобной группировки",
                  },
                  {
                    title: "Бюджеты",
                    desc: "Устанавливайте лимиты по категориям и следите за исполнением",
                  },
                  {
                    title: "Фильтрация и отчёты",
                    desc: "Фильтруйте по датам, категориям и типам операций",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#10B981]/20">
                      <Check className="h-4 w-4 text-[#10B981]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">{item.title}</h4>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
