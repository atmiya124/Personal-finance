import { z } from "zod";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/date-picker";
import { AmountInput } from "@/components/amount-input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { insertTransactionSchema } from "@/db/schema";
import { converAmountToMiliunits } from "@/lib/utils";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    
} from "@/components/ui/form";


const formSchema = z.object({
    date: z.coerce.date(),
    accountId: z.string(),
    categoryId: z.string().nullable().optional(),
    payee: z.string(),
    amount: z.string(),
    notes: z.string().nullable().optional(),
});

const apiSchema = insertTransactionSchema.omit({
    id: true,
});

type FormValues = z.input<typeof formSchema>;
type ApiFormValues = z.input<typeof apiSchema>;

type Props = {
    id?: string;
    defaultValues?: FormValues;
    onSubmit: (values: FormValues) => void;
    onDelete?: () => void;
    disabled?: boolean;
    accountOptions: { label: string; value: string; }[];
    categoryOptions: { label: string; value: string; }[];
    onCreateAccount: (name: string) => void;
    onCreateCategory: (name: string) => void;

};


export const TransactionForm = ({
    id,
    defaultValues,
    onSubmit,
    onDelete,
    disabled,
    accountOptions,
    categoryOptions,
    onCreateAccount,
    onCreateCategory,
}: Props) => {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues,
    });

    const handleSubmit = (values: FormValues) => {
        const amount = parseFloat(values.amount)
        const amountInMiliunits = converAmountToMiliunits(amount)

        // console.log({ values });
        onSubmit({
            ...values,
            amount: amountInMiliunits,
        });
    };

    const handleDelete = () => {
        onDelete?.();
    };

    return (
        <Form {...form}>
            <form 
                onSubmit ={form.handleSubmit(handleSubmit)}
                className="space-y-4 p-4 text-lg"
            >

                {/* ===================== Date =================== */}
                <FormField
                    name="date"
                    control={form.control}
                    render={( {field} ) => (
                        <FormItem>
                            <FormControl>
                                <DatePicker 
                                    value={field.value ?? ""}
                                    onChange={(date) => field.onChange(date)}
                                    disabled={disabled}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                {/* ===================== Add/Select account =================== */}
                <FormField
                    name="accountId"
                    control={form.control}
                    render={( {field} ) => (
                        <FormItem>
                            <FormLabel>
                                Account
                            </FormLabel>
                                                        <FormControl>
                                                            <Select
                                                                value={field.value ?? ""}
                                                                onValueChange={field.onChange}
                                                                disabled={disabled}
                                                            >
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Select an account" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {accountOptions.map((option) => (
                                                                        <SelectItem key={option.value} value={option.value}>
                                                                            {option.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                        </FormItem>
                    )}
                />
                {/* ===================== Add/Select Category =================== */}
                <FormField
                    name="categoryId"
                    control={form.control}
                    render={( {field} ) => (
                        <FormItem>
                            <FormLabel>
                                Category
                            </FormLabel>
                                                        <FormControl>
                                                            <Select
                                                                value={field.value ?? ""}
                                                                onValueChange={field.onChange}
                                                                disabled={disabled}
                                                            >
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Select a category" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {categoryOptions.map((option) => (
                                                                        <SelectItem key={option.value} value={option.value}>
                                                                            {option.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                        </FormItem>
                    )}
                />
                {/* ===================== Add Payee =================== */}
                <FormField
                    name="payee"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Payee</FormLabel>
                            {/* Pass id and ref directly to Input for proper focus */}
                            <Input
                                id={field.name}
                                ref={field.ref}
                                disabled={disabled}
                                placeholder="Add a payee"
                                {...field}
                                value={field.value ?? ""}
                            />
                        </FormItem>
                    )}
                />
                {/* ===================== Add Amount =================== */}
                <FormField
                    name="amount"
                    control={form.control}
                    render={( {field} ) => (
                        <FormItem>
                            <FormLabel>
                                Amount
                            </FormLabel>
                            <FormControl>
                                <AmountInput 
                                    disabled={disabled}
                                    placeholder="0.00"
                                    {...field}
                                    value={field.value ?? ""}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                {/* ===================== Notes =================== */}
                <FormField
                    name="notes"
                    control={form.control}
                    render={( {field} ) => (
                        <FormItem>
                            <FormLabel>
                                Notes
                            </FormLabel>
                            <FormControl>
                               <Textarea 
                                    {...field}
                                    value={field.value ?? ""}
                                    disabled={disabled}
                                    placeholder="Optional notes"
                               />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <Button className="w-full" disabled={disabled}>
                    {id ? "Save changes": "Create transaction"}
                </Button>
                {!!id && <Button 
                    type="button"
                    disabled={disabled}
                    onClick={handleDelete}
                    className="w-full"
                    variant="outline"
                >
                    <Trash className="size-4 mr-2" />
                        Delete transaction
                </Button>}
            </form>
        </Form>
    )
}