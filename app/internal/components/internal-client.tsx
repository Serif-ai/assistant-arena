"use client";

import { Mail, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "./file-upload";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { upload } from "@/lib/actions/upload";

enum UploadType {
  EMAIL = "email",
  AI = "ai",
  GROUND_TRUTH = "groundTruth",
}

interface UploadTypeConfig {
  title: string;
  icon: JSX.Element;
  description: string;
  format: object;
}

const uploadTypeConfig: Record<UploadType, UploadTypeConfig> = {
  [UploadType.EMAIL]: {
    title: "Email Threads",
    icon: <Mail className="h-6 w-6" />,
    description:
      "Upload datasets of email threads including ground truth for each thread.",
    format: [
      {
        id: "thread_001",
        userEmail: "john.doe@example.com",
        emails: [
          {
            subject: "Subject of the email...",
            from: "john.doe@example.com",
            to: "manager@example.com",
            cc: "team@example.com",
            bcc: "team@example.com",
            date: "2024-03-20T11:30:00Z",
            text: "Content of the email....",
          },
        ],
      },
    ],
  },
  [UploadType.AI]: {
    title: "AI Responses",
    icon: <Bot className="h-6 w-6" />,
    description:
      "Upload datasets of AI-generated responses that correspond to email threads.",
    format: [
      {
        threadId: "thread_001",
        draft: {
          subject: "Subject of the email...",
          from: "john.doe@example.com",
          to: "manager@example.com",
          cc: "team@example.com",
          bcc: "team@example.com",
          date: "2024-03-20T11:30:00Z",
          text: "Content of the email....",
        },
      },
    ],
  },
  [UploadType.GROUND_TRUTH]: {
    title: "Ground Truth",
    icon: <Bot className="h-6 w-6" />,
    description:
      "Upload datasets of ground truth responses that correspond to email threads.",
    format: [
      {
        threadId: "thread_001",
        email: {
          subject: "Subject of the email...",
          from: "john.doe@example.com",
          to: "manager@example.com",
          cc: "team@example.com",
          bcc: "team@example.com",
          date: "2024-03-20T10:30:00Z",
          text: "Content of the email....",
        },
      },
    ],
  },
} as const;

export default function InternalClient() {
  const [isProcessing, setIsProcessing] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [orgInputType, setOrgInputType] = useState<"select" | "input">(
    "select"
  );
  const [newOrgInput, setNewOrgInput] = useState("");
  const [model, setModel] = useState<string>("");
  const [uploadType, setUploadType] = useState<UploadType>(UploadType.EMAIL);

  const organization = orgInputType === "select" ? selectedOrg : newOrgInput;

  const submittable = useMemo(() => {
    if (uploadType === UploadType.AI) {
      return !!file && !!organization && !!model;
    }

    return !!file;
  }, [file, organization, model, uploadType]);

  const handleProcessUploads = async () => {
    const organization = orgInputType === "select" ? selectedOrg : newOrgInput;

    if (!file) {
      toast.error("Please upload at least one file.");
      return;
    }

    if (uploadType === UploadType.AI) {
      if (!organization || !model) {
        if (!organization) {
          toast.error("Please provide an organization.");
        } else if (!model) {
          toast.error("Please provide a model.");
        }
        return;
      }
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      if (uploadType === UploadType.EMAIL) {
        formData.append("emailThreads", file);
      }

      if (uploadType === UploadType.GROUND_TRUTH) {
        formData.append("groundTruth", file);
      }

      if (uploadType === UploadType.AI) {
        formData.append("aiResponses", file);
        formData.append("organization", organization);
        formData.append("model", model);
      }

      const response = await upload(formData);
      if (!response.success) {
        throw new Error("Upload failed");
      }

      const data = response.data;
      const successMessage = `Processed ${[
        data.threadCount ? `${data.threadCount} threads` : "",
        data.responseCount ? `${data.responseCount} AI responses` : "",
        data.groundTruthCount
          ? `${data.groundTruthCount} ground truth responses`
          : "",
      ]
        .filter(Boolean)
        .join(" and ")}.`;

      toast.success(successMessage);

      handleClear();
    } catch (error) {
      console.error(error);
      toast.error("Failed to process uploads. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setSelectedOrg("");
    setNewOrgInput("");
    setModel("");
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Internal Tools</h1>
          <p className="text-muted-foreground">
            Manage email thread datasets and AI-generated responses
          </p>
        </div>

        <div className="space-y-8">
          <div className="flex justify-center">
            <RadioGroup
              value={uploadType}
              onValueChange={(value) => setUploadType(value as UploadType)}
              className="flex items-center space-x-6"
            >
              {Object.entries(uploadTypeConfig).map(([type, config]) => (
                <div key={type} className="flex items-center space-x-2">
                  <RadioGroupItem value={type} id={type} />
                  <Label htmlFor={type}>{config.title}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="rounded-lg border max-w-2xl mx-auto">
            <FileUpload
              title={uploadTypeConfig[uploadType].title}
              icon={uploadTypeConfig[uploadType].icon}
              description={uploadTypeConfig[uploadType].description}
              format={uploadTypeConfig[uploadType].format}
              onFileSelect={setFile}
              value={file}
            />

            {uploadType === UploadType.AI && (
              <div className="space-y-4 p-6 border-t">
                <div className="space-y-2">
                  <Label>Organization</Label>
                  <RadioGroup
                    defaultValue="select"
                    value={orgInputType}
                    onValueChange={(value) =>
                      setOrgInputType(value as "select" | "input")
                    }
                    className="flex items-center space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="select" id="select" />
                      <Label htmlFor="select">Select Existing</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="input" id="input" />
                      <Label htmlFor="input">Add New</Label>
                    </div>
                  </RadioGroup>

                  {orgInputType === "select" ? (
                    <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                      <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder="Select organization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="serif">Serif</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type="text"
                      placeholder="Enter organization name"
                      value={newOrgInput}
                      onChange={(e) => setNewOrgInput(e.target.value)}
                      className="w-[280px]"
                    />
                  )}
                </div>

                {uploadType === UploadType.AI && (
                  <div>
                    <Label>Model</Label>
                    <Input
                      type="text"
                      placeholder="Enter model name"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-[280px]"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              onClick={handleProcessUploads}
              disabled={isProcessing || !submittable}
            >
              {isProcessing ? "Processing..." : "Process Uploads"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleClear}
              disabled={isProcessing}
            >
              Clear All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
