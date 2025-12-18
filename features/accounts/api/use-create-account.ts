import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { client } from "@/lib/hono";

type ResponseType = any;
type RequestType = any;


export const useCreateAccount = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async (json) => {
            const response = await (client as any).api.accounts.$post({ json });
            return await response.json();
        },
        onSuccess: () => {
            toast.success("Account created")
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
            queryClient.invalidateQueries({ queryKey: ["summary"] });
        },
        onError: () => {
             toast.error("Failed to create account");
        },
    })

    return mutation;
}