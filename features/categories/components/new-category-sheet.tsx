import { z } from "zod";
import { insertCategorySchema } from "@/db/schema";
import { CategoryForm } from "@/features/categories/components/category-form";
import { useNewCategory } from "../hooks/use-new-category";
import { useCreateCategory } from "../api/use-create-category";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

const formSchema = insertCategorySchema.pick({
    name: true,
}) as unknown as z.ZodType<any, any, any>;
type FormValues = z.infer<typeof formSchema>;
const NewCategorySheet = () => {
    const {isOpen, onClose} = useNewCategory();

    const mutation = useCreateCategory();

    const onSubmit = (values: FormValues) => {
        mutation.mutate(values, {
            onSuccess: () => {
                onClose();
            }
        });
        
    };

    return ( 
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="space-y-4">
                <SheetHeader>
                    <SheetTitle>
                        New Category
                    </SheetTitle>
                    <SheetDescription>
                        Create new category to organize your transactions.
                    </SheetDescription>
                </SheetHeader>
                <CategoryForm 
                    onSubmit={onSubmit} 
                    disabled={mutation.isPending} 
                    defaultValues={{
                        name:"",
                    }}
                />
            </SheetContent>
        </Sheet>
     );
}
 
export default NewCategorySheet;