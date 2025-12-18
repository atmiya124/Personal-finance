import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<(typeof client & any)["api"]["/accounts/bulk-delete"]["$post"]>;
type RequestType = InferRequestType<(typeof client & any)["api"]["/accounts/bulk-delete"]["$post"]>;


export const useBulkDeleteAccounts = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<any, Error, any>({
        mutationFn: async (json) => {
            const response = await (client as any).api["/accounts/bulk-delete"]["$post"]({ json });
            return await response.json();
        },
        onSuccess: () => {
            toast.success("Accounts deleted")
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
            queryClient.invalidateQueries({ queryKey: ["summary"] });
        },
        onError: () => {
             toast.error("Failed to delete account");
        },
    })

    return mutation;
}