// import { UserButton } from "@clerk/nextjs"
"use client";

import { DataCharts } from "@/components/data-charts";
import DataGrid from "@/components/data.grid";


export default function DasboardPage() {

  return (
    <div className="max-w-sceen-2xl mx-auto w-full pb-10 -mt-24">
      <DataGrid />
      <DataCharts />
    </div>
  )
}
