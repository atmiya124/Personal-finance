import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { client } from "@/lib/hono";

type ResponseType = any;
type RequestType = any;


export const useCreateTransaction = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async (json) => {
            const response = await (client as any).api.transactions.$post({ json });
            return await response.json();
        },
        onSuccess: () => {
            toast.success("Transaction created")
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["summary"] });
        },
        onError: () => {
             toast.error("Failed to create transaction");
        },
    })

    return mutation;
}