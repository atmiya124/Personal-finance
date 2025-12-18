import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"

import { client } from "@/lib/hono"
import { converAmountFromMiliunits } from "@/lib/utils"

export const useGetSummary = () => {
    const params = useSearchParams()
    const from = params.get("from") || ""
    const to = params.get("to") || ""
    const accountId = params.get("accountId") || ""


    const query = useQuery({
        
        queryKey: ["summary", { from, to, accountId }],
        queryFn: async () => {
            const response = await (client as any).api.summary.$get({
                query: {
                    from,
                    to,
                    accountId
                }
            })

            if(!response.ok){
                throw new Error("Failed to fetch summary")
            }

            const { data } = await response.json()
            console.log("Fetched categories:", data.categories);
            return {
                ...data,
                incomeAmount: converAmountFromMiliunits(data.incomeAmount),
                expensesAmount: converAmountFromMiliunits(data.expensesAmount),
                remainingAmount: converAmountFromMiliunits(data.remainingAmount),
                categories: data.categories.map((category: { value: number; [key: string]: any }) => ({
                    ...category,
                    value: converAmountFromMiliunits(category.value)    
                })),
                days: data.days.map((day: { income: number; expenses: number; [key: string]: any }) => ({
                    ...day,
                    income: converAmountFromMiliunits(day.income),
                    expenses: converAmountFromMiliunits(day.expenses),
                }))
            }
        },
    })

    return query
}