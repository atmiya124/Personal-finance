"use client"

import qs from "query-string";
import { Suspense } from "react";
import {
    usePathname,
    useRouter,
    useSearchParams
} from "next/navigation";

import { 
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue
} from "./ui/select"

import { useGetSummary } from "@/features/summary/api/use-get-summary";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";

 export const AccountFilter = () => {
    const router = useRouter();
    const pathname = usePathname();

    const params = useSearchParams();
    const accountId = params.get("accountId") || "all";
    const from = params.get("from") || "";
    const to = params.get("to") || "";

    const {
        isLoading: isLoadingSummary,
    } = useGetSummary();

    const { 
        data: accounts,
        isLoading: isLoadingAccounts,
    } = useGetAccounts();


    const onChange = (newValue: string) => {
        const query = {
            accountId: newValue,
            from,
            to
        }
        if (newValue === "all") {
            query.accountId = "";
        }

        const url = qs.stringifyUrl({
            url: pathname,
            query
        }, { skipNull: true, skipEmptyString: true });
        router.push(url);
    }

    return (
        <Suspense fallback={<div className="w-32 h-8 bg-gray-100 animate-pulse rounded" />}>
            <Select value={accountId} onValueChange={onChange} disabled={isLoadingAccounts || isLoadingSummary}>
                <SelectTrigger className="lg:w-auto w-full h-9 rounded-md px-3 font-normal bg-white/10 hover:bg-white/20 hover:text-white border-none focus-ring-offset-0 focus:ring-transparent outline-none text-white focus:bg-white/30 transition">
                    <SelectValue placeholder="Account" />
                    <SelectContent>
                        <SelectItem value="all">All Accounts</SelectItem>
                        {accounts?.map((account: { id: string; name: string }) => (
                            <SelectItem key={account.id} value={account.id}>
                                {account.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </SelectTrigger>
            </Select>
        </Suspense>
    );
}