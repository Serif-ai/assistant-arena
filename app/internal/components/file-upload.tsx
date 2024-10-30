import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  title: string;
  icon: React.ReactNode;
  description: string;
  format: object;
}

export function FileUpload({ onFileSelect, title, icon, description, format }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json']
    },
    maxFiles: 1
  });

  return (
    <div className="bg-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        {icon}
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center space-y-4 transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}`}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
        <div>
          <Button variant="secondary">Choose JSON File</Button>
          <p className="mt-2 text-sm text-muted-foreground">
            or drag and drop your file here
          </p>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        <p className="font-medium">Required format:</p>
        <pre className="mt-2 p-3 bg-muted rounded-md overflow-x-auto">
          {JSON.stringify(format, null, 2)}
        </pre>
      </div>
    </div>
  );
}
