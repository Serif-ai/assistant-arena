import { AIResponse } from "@prisma/client";
import { TypedEmail } from ".";

export type TypedAIResponse = Omit<AIResponse, "draft"> & {
  draft: TypedEmail;
};

export type AIResponseCreateBody = Omit<
  TypedAIResponse,
  "id" | "createdAt" | "updatedAt"
>;

export type UploadedAIResponse = {
  draft: TypedEmail;
  threadId: string;
};
