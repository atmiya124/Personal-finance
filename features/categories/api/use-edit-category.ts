import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.categories[":id"]["$patch"]>
type FullRequestType = InferRequestType<typeof client.api.categories[":id"]["$patch"]>;
type RequestType = FullRequestType["json"];

export const useEditCategory = (id?: string) => {
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async (json) => {
            const response = await client.api.categories[":id"]["$patch"]({ 
                param: { id },
                json,
            });
            return await response.json();
        },
        onSuccess: () => {
            toast.success("Category updated")
            queryClient.invalidateQueries({ queryKey: ["category", { id }] });
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            queryClient.invalidateQueries({ queryKey: ["trasactions"] });
            queryClient.invalidateQueries({ queryKey: ["summary"] });
        },
        onError: () => {
             toast.error("Failed to edit Category");
        },
    })

    return mutation;
}