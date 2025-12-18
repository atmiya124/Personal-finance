import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { client } from "@/lib/hono";

type ResponseType = any;
type RequestType = any;


export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async (json) => {
            const response = await (client as any).api.categories.$post({ json });
            return await response.json();
        },
        onSuccess: () => {
            toast.success("Category created")
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
        onError: () => {
             toast.error("Failed to create category");
        },
    })

    return mutation;
}