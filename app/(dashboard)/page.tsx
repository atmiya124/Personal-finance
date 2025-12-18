// import { UserButton } from "@clerk/nextjs"
"use client";


import { DataCharts } from "@/components/data-charts";
import DataGrid from "@/components/data.grid";
import RecentTransactionsTable from "./recent-transactions-table";


export default function DasboardPage() {
  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <DataGrid />
      <DataCharts />
      <div className="mt-8 w-full">
        <RecentTransactionsTable />
      </div>
    </div>
  );
}
