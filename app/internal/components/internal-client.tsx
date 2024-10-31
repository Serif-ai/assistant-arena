"use client";

import { Mail, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "./file-upload";
import { useEffect, useState } from "react";
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

export default function InternalClient() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [emailThreadFile, setEmailThreadFile] = useState<File | null>(null);
  const [aiResponseFile, setAiResponseFile] = useState<File | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [orgInputType, setOrgInputType] = useState<"select" | "input">(
    "select"
  );
  const [newOrgInput, setNewOrgInput] = useState("");
  const [model, setModel] = useState<string>("");

  const organization = orgInputType === "select" ? selectedOrg : newOrgInput;

  useEffect(() => {
    console.log("welcome", toast);
    toast.info("Welcome to the internal tools!");
  }, []);

  const submittable =
    emailThreadFile || (aiResponseFile && organization && model);

  const handleProcessUploads = async () => {
    const organization = orgInputType === "select" ? selectedOrg : newOrgInput;

    if (!emailThreadFile && !aiResponseFile) {
      toast.error("Please upload at least one file.");
      return;
    }

    if (aiResponseFile && !organization) {
      toast.error("Please provide an organization for AI responses.");
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      if (emailThreadFile) {
        formData.append("emailThreads", emailThreadFile);
      }
      if (aiResponseFile) {
        formData.append("aiResponses", aiResponseFile);
        formData.append("organization", organization);
        formData.append("model", model);
      }

      console.log("formData", formData);
      

      const response = await fetch("/api/internal/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      const successMessage = `Processed ${
        emailThreadFile ? `${data.threadCount} threads` : ""
      }${emailThreadFile && aiResponseFile ? " and " : ""}${
        aiResponseFile ? `${data.responseCount} AI responses` : ""
      }.`;

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
    setEmailThreadFile(null);
    setAiResponseFile(null);
    setSelectedOrg("");
    setNewOrgInput("");
    toast.success("Cleared all files");
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

        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-lg border ">
            <FileUpload
              title="Email Threads"
              icon={<Mail className="h-6 w-6" />}
              description="Upload datasets of email threads including ground truth for each thread."
              format={{
                id: "thread_123",
                thread: [
                  { from: "user@example.com", content: "..." },
                  { from: "other@example.com", content: "..." },
                ],
                groundTruth: { content: "..." },
              }}
              onFileSelect={setEmailThreadFile}
            />
          </div>

          <div className="rounded-lg border ">
            <FileUpload
              title="AI Responses"
              icon={<Bot className="h-6 w-6" />}
              description="Upload datasets of AI-generated responses that correspond to email threads."
              format={{
                id: "response_123",
                exampleId: "thread_123",
                response: "AI generated response content...",
              }}
              onFileSelect={setAiResponseFile}
            />

            {aiResponseFile && (
              <div className="space-y-4 p-6 border-t">
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
