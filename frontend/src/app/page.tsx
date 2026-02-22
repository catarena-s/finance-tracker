"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { ArrowLeftRight, FolderTree, PiggyBank, Check } from "lucide-react";

const linkButtonClass =
  "inline-flex items-center justify-center rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-fintech-hover transition-colors";

export default function HomePage() {
  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4 sm:text-5xl">
            Трекер личных финансов
          </h1>
          <p className="text-xl text-muted-foreground mb-12">
            Управляйте своими финансами легко и прозрачно
          </p>

          <div className="grid grid-cols-1 gap-6 mb-12 md:grid-cols-3">
            <Card className="shadow-fintech hover:shadow-fintech-hover transition-shadow">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <ArrowLeftRight className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Транзакции</h3>
                <p className="text-muted-foreground mb-4">
                  Учёт доходов и расходов
                </p>
                <Link href="/transactions" className={linkButtonClass}>
                  Перейти
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-fintech hover:shadow-fintech-hover transition-shadow">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <FolderTree className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Категории</h3>
                <p className="text-muted-foreground mb-4">
                  Организуйте учёт по категориям
                </p>
                <Link href="/categories" className={linkButtonClass}>
                  Перейти
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-fintech hover:shadow-fintech-hover transition-shadow">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <PiggyBank className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Бюджеты</h3>
                <p className="text-muted-foreground mb-4">
                  Контроль лимитов расходов
                </p>
                <Link href="/budgets" className={linkButtonClass}>
                  Перейти
                </Link>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-fintech text-left">
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6 text-foreground">Возможности</h2>
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
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/20 mt-0.5">
                      <Check className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
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
