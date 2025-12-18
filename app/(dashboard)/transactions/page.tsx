"use client";
import React, { Suspense } from "react";

import { toast } from "sonner";
import { useState } from "react";

import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { useBulkDeleteTransactions } from "@/features/transactions/api/use-bulk-delete-transactions";
import { useBulkCreateTransactions } from "@/features/transactions/api/use-bulk-create-transactions";

import { useSelectAccount } from "@/features/accounts/hooks/use-select-account";

import { transactions as transactionSchema } from "@/db/schema"
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { Loader2, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
    Card,
    CardContent,
    CardHeader,
    CardTitle,

 } from "@/components/ui/card";

import { columns as baseColumns } from "./columns";
import { CategoryColumn } from "./category-column";
import { AccountColumn } from "./account-column";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
 import { ImportCard } from "./import-card";
import { UploadButton } from "./upload-button";

 enum VARIANTS {
     LIST = "LIST",
     IMPORT = "IMPORT"
 };

 type ImportResults = {
    data: string[][];
    errors: unknown[];
    meta: Record<string, unknown>;
 };

 const INTIAL_IMPORT_RESULTS: ImportResults = {
    data: [],
    errors: [],
    meta: {},
 };

const TransactionsPage = () => {
     const [AccountDialog, confirm] = useSelectAccount();
     const [variant, setVariant] = useState<VARIANTS>(VARIANTS.LIST)
     const [importResults, setImportResults] = useState<ImportResults>(INTIAL_IMPORT_RESULTS)

    const onUpload = (results: { data: string[] }[]) => {
        // Parse the CSV results into the expected format
        const data = results[0]?.data && Array.isArray(results[0].data)
            ? (results as any[]).map((r) => r.data) // fallback for multiple rows
            : [];
        setImportResults({
            data,
            errors: [],
            meta: {},
        });
        setVariant(VARIANTS.IMPORT);
    }

    const onCancelImport = () => {
        setImportResults(INTIAL_IMPORT_RESULTS);
        setVariant(VARIANTS.LIST);
    }

    const newTransaction = useNewTransaction();
    const createTransactions = useBulkCreateTransactions();
    const deleteTransactions = useBulkDeleteTransactions();
    const transactionsQuery = useGetTransactions();
        const transactions = transactionsQuery.data || [];
        const { data: categories = [] } = useGetCategories();
        const { data: accounts = [] } = useGetAccounts();

        // Build lookup maps
        const categoryMap = React.useMemo(() => {
            const map: Record<string, string> = {};
            categories.forEach((cat: any) => { map[cat.id] = cat.name; });
            return map;
        }, [categories]);
        const accountMap = React.useMemo(() => {
            const map: Record<string, string> = {};
            accounts.forEach((acc: any) => { map[acc.id] = acc.name; });
            return map;
        }, [accounts]);

        // Patch columns to inject names
        const columns = React.useMemo(() => baseColumns.map(col => {
            if (typeof col === 'object' && 'accessorKey' in col) {
                if (col.accessorKey === 'category') {
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
                        }
                    };
                }
                if (col.accessorKey === 'account') {
                    return {
                        ...col,
                        cell: ({ row }: any) => {
                            const accountId = row.original.accountId;
                            const accountName = accountId ? accountMap[accountId] || "" : "";
                            return (
                                <AccountColumn
                                    account={accountName}
                                    accountId={accountId}
                                />
                            );
                        }
                    };
                }
            }
            return col;
        }), [baseColumns, categoryMap, accountMap]);

    const isDisabled = 
    transactionsQuery.isLoading ||
    deleteTransactions.isPending;

    const onSubmitImport = async (
         values: typeof transactionSchema.$inferInsert[],
    ) => {
        const accountId = await confirm();

        if(!accountId) {
            return toast.error("Please select an account to continue.");
        }

        const data = values.map((value) => ({
            ...value,
            accountId: accountId as string,
        }));

        createTransactions.mutate(data, {
            onSuccess: (response) => {
                console.log("Bulk create API response:", response);
                onCancelImport();
                transactionsQuery.refetch().then((result) => {
                    console.log("Transactions after refetch:", result?.data);
                });
            },
            onError: (error) => {
                toast.error("Import failed");
                console.error(error);
            }
        });
    };

    return (
        <Suspense fallback={<div className="w-full flex justify-center items-center h-96"><Loader2 className="size-6 text-slate-300 animate-spin" /></div>}>
            {transactionsQuery.isLoading ? (
                <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
                    <Card className="border-none drop-shadow-sm">
                        <CardHeader className="text-xl line-clamp-1">
                            <Skeleton className="h-8 w-48" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-[500px] w-full flex items-center justify-center">
                                <Loader2 className="size-6 text-slate-300 animate-spin" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : variant === VARIANTS.IMPORT ? (
                <>
                    <AccountDialog />
                    <ImportCard 
                        data={importResults.data}
                        onCancel={onCancelImport}
                        onSubmit={onSubmitImport}
                    />
                </>
            ) : (
                <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
                    <Card className="border-none drop-shadow-sm">
                        <CardHeader className="gap-y-2 lg:flex lg:items-center lg:justify-between">
                            <CardTitle className="text-xl line-clamp-1">
                                Transaction History
                            </CardTitle>
                            <div className="flex flex-col lg:flex-row gap-y-2 items-center gap-x-2">
                                <Button
                                    onClick={newTransaction.onOpen}
                                    size="sm"
                                    className="w-full lg:w-auto"
                                >
                                    <Plus className="size-4 mr-2" />
                                    Add New
                                </Button>
                                <UploadButton onUpload={onUpload} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                filterKey="payee"
                                columns={columns}
                                data={transactions}
                                onDelete={(row) => {
                                    const ids = row.map((r) => r.original.id);
                                    deleteTransactions.mutate({ ids });
                                }}
                                disabled={isDisabled}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}
        </Suspense>
    );
}
 
export default TransactionsPage;