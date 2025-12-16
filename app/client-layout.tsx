"use client";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { QueryProvider } from "@/providers/query-provider";
import SheetProvider from "@/providers/sheet-provider";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <QueryProvider>
        <SheetProvider />
        <Toaster />
        {children}
      </QueryProvider>
    </ClerkProvider>
  );
}