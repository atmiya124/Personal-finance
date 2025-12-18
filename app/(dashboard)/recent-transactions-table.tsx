
"use client";
import React from "react";

import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { columns as transactionColumns } from "./transactions/columns";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { DataTable } from "@/components/data-table";
import { CategoryColumn } from "./transactions/category-column";


// Utility to pick only the columns we want for dashboard, but override category column to inject category name
function getDashboardColumns(categoryMap: Record<string, string>) {
  return transactionColumns
    .filter((col) => {
      if (typeof col === "object" && "accessorKey" in col) {
        return ["date", "category", "payee", "amount"].includes(col.accessorKey as string);
      }
      return false;
    })
    .map((col) => {
      if (
        typeof col === "object" &&
        "accessorKey" in col &&
        col.accessorKey === "date"
      ) {
        return col;
      }
      if (
        typeof col === "object" &&
        "accessorKey" in col &&
        col.accessorKey === "category"
      ) {
        return {
          ...col,
          cell: ({ row }: any) => {
            const categoryId = row.original.categoryId;
            const categoryName = categoryId ? categoryMap[categoryId] || "Uncategorized" : "Uncategorized";
            return (
              <CategoryColumn
                id={row.original.id}
                category={categoryName}
                categoryId={categoryId}
              />
            );
          },
        };
      }
      return col;
    });
}

export default function RecentTransactionsTable() {
  const { data = [], isLoading } = useGetTransactions();
  const { data: categories = [] } = useGetCategories();
  // Build a map of categoryId to category name
  const categoryMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((cat: any) => {
      map[cat.id] = cat.name;
    });
    return map;
  }, [categories]);

  // Sort by date descending and take 10 most recent
  const recent = [...data]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const dashboardColumns = React.useMemo(() => getDashboardColumns(categoryMap), [categoryMap]);

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold mb-2">Recent Transactions</h2>
      <DataTable
        columns={dashboardColumns}
        data={recent}
        filterKey="payee"
        onDelete={() => {}}
        disabled={isLoading}
      />
    </div>
  );
}
