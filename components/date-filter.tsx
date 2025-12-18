"use client";


import { useState, Suspense } from "react";
import { format, subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { ChevronDown } from "lucide-react";

import qs from "query-string";
import {
    usePathname,
    useRouter,
    useSearchParams
} from "next/navigation";




import { formatDateRange } from "@/lib/utils";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar"
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from "./ui/popover";

export const DateFilter = () => {
    const router = useRouter();
    const pathname = usePathname();

    const params = useSearchParams();
    const accountId = params.get("accountId");
    const from = params.get("from") || "";
    const to = params.get("to") || "";

    const defaultTo = new Date();
    const defaultFrom = subDays(defaultTo, 30);

    const paramState = {
        from: from ? new Date(from) : defaultFrom,
        to: to ? new Date(to) : defaultTo,
    };
    const [dateRange, setDateRange] = useState<DateRange | undefined>(
        paramState
    );



    const pushToUrl = (dateRange: DateRange | undefined) => {
        const query = {
            from: format(dateRange?.from || defaultFrom, "yyyy-MM-dd"),
            to: format(dateRange?.to || defaultTo, "yyyy-MM-dd"),
            accountId,
        }
        const url = qs.stringifyUrl({
            url: pathname,
            query,
        }, { skipNull: true, skipEmptyString: true });

        router.push(url);
    }

    const onReset = () => {
        setDateRange(undefined)
        pushToUrl(undefined);
    }

    return (
        <Suspense fallback={<div className="w-32 h-8 bg-gray-100 animate-pulse rounded" />}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        disabled={false}
                        size="sm"
                        variant="outline"
                        className="lg:w-auto w-full h-9 rounded-md px-3 font-normal bg-white/10 hover:bg-white/20 hover:text-white border-none focus-ring-offset-0 focus:ring-transparent outline-none text-white focus:bg-white/30 transition"
                        >
                        {/* <span>{formatDateRange(paramState.from, paramState.to)}</span> */}
                        <span>{formatDateRange(paramState)}</span>
                        <ChevronDown className="size-4 ml-2 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                    <Calendar
                        disabled={false}
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from || undefined}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                    />
                    <div className="p-4 w-full flex items-center gap-x-2">
                        <PopoverClose asChild>
                            <Button
                                onClick={onReset}
                                disabled={!dateRange?.from || !dateRange?.to}
                                variant="outline"
                            >
                                Reset
                            </Button>
                        </PopoverClose>
                        <PopoverClose asChild>
                            <Button
                                onClick={() => pushToUrl(dateRange)}
                                disabled={!dateRange?.from || !dateRange?.to}
                            >
                                Apply
                            </Button>
                        </PopoverClose>
                    </div>
                </PopoverContent>
            </Popover>
        </Suspense>
    )
};
