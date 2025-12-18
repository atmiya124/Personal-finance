// ...removed 'use client' per server-only DB rule

import { useNewCategory } from "@/features/categories/hooks/use-new-category";
import { useBulkDeleteCategories } from "@/features/categories/api/use-bulk-delete-categories";
import { useGetCategories } from "@/features/categories/api/use-get-categories";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { Loader2, Plus } from "lucide-react";
import { 
    Card,
    CardContent,
    CardHeader,
    CardTitle,

 } from "@/components/ui/card";

import { columns } from "./columns";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

const CategoriesPage = () => {

    const newCategories = useNewCategory();
    const deleteCategories = useBulkDeleteCategories();
    const categoriesQuery = useGetCategories();
    const categories = categoriesQuery.data || [];

    const isDesabled = 
    categoriesQuery.isLoading ||
    deleteCategories.isPending;

    if (categoriesQuery.isLoading) {
        return (
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
        );
    }

    return (
        <Suspense fallback={<div className="w-full flex justify-center items-center h-96"><Loader2 className="size-6 text-slate-300 animate-spin" /></div>}>
            <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
                <Card className="border-none drop-shadow-sm">
                    <CardHeader className="gap-y-2 lg:flex lg:items-center lg:justify-between">
                        <CardTitle className="text-xl line-clamp-1">
                            Categories Page
                        </CardTitle>
                        <Button onClick={newCategories.onOpen} size="sm">
                            <Plus className="size-4 mr-2" />Add New
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            filterKey="name"
                            columns={columns}
                            data={categories}
                            onDelete={(row) => {
                                const ids = row.map((r) => r.original.id);
                                deleteCategories.mutate({ ids });
                            }}
                            disabled={isDesabled}
                        />
                    </CardContent>
                </Card>
            </div>
        </Suspense>
    );
}
 
export default CategoriesPage;