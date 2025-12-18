

import { AccountFilter } from "./account-filter";
import { DateFilter } from "./date-filter";
import { Suspense } from "react";


export const Filters = () => {
    return (
        <Suspense fallback={<div className="w-full h-8 bg-gray-100 animate-pulse rounded" />}>
            <div className="flex flex-col lg:flex-row items-center gap-y-2 lg:gap-y-0 lg:gap-x-2">
                <AccountFilter />
                <DateFilter />
            </div>
        </Suspense>
    );
}