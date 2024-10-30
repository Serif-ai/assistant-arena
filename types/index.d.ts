import {
  User,
  Organization,
  EmailThread,
  Message,
  AIResponse,
} from "@prisma/client";

export type TypedOrganization = Organization;

export type TypedEmailThread = EmailThread;

export type TypedMessage = Message;

export type TypedAIResponse = AIResponse;

export type TypedUser = User;