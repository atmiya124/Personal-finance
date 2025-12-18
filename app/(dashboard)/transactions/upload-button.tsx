import { Upload } from "lucide-react";
import { useCSVReader } from "react-papaparse";

import { Button } from "@/components/ui/button";


type Props = {
    onUpload: (results: { data: string[] }[]) => void;
};

export const UploadButton = ({ onUpload } : Props) => {
    const { CSVReader } = useCSVReader();
    
    return (
        <CSVReader onUploadAccepted={onUpload}>
            {(props: { getRootProps: () => Record<string, unknown> }) => (
                <Button
                    size="sm"
                    className="w-full lg:w-auto"
                    {...props.getRootProps()}
                >
                    <Upload className="size-4 mr-2" />
                    Import
                </Button>
            )}
        </CSVReader>
    )
}
