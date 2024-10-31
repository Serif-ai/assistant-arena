import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  title: string;
  icon: React.ReactNode;
  description: string;
  format: object;
}

export function FileUpload({
  onFileSelect,
  title,
  icon,
  description,
  format,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [fileContent, setFileContent] = useState<string>("");

  const handlePreview = async (file: File) => {
    try {
      const content = await file.text();
      try {
        const jsonContent = JSON.parse(content);
        setFileContent(JSON.stringify(jsonContent, null, 2));
      } catch {
        setFileContent(content);
      }
      setIsPreviewOpen(true);
    } catch (error) {
      console.error("Error reading file:", error);
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/json": [".json"],
    },
    maxFiles: 1,
  });

  return (
    <>
      <div className="bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          {icon}
          <h2 className="text-2xl font-semibold">{title}</h2>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>

        {selectedFile && (
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreview(selectedFile);
                  }}
                >
                  Preview
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    onFileSelect(null);
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        )}

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center space-y-4 transition-colors
            ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25"
            }`}
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

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>File Preview: {selectedFile?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <pre className="p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap overflow-x-auto">
              {fileContent}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
