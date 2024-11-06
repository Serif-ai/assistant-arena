import { Thread, Model } from "@prisma/client";
import { TypedEmail, ThreadWithResponses } from ".";

export type TypedEmailThread = Omit<Thread, "emails"> & {
  emails: TypedEmail[];
  model: Model;
};

export type EmailThreadCreateBody = Omit<
  TypedEmailThread,
  "createdAt" | "updatedAt"
>;

export type GetThreadsResponse = {
  userId: string;
  threads: ThreadWithResponses[];
  hasMore: boolean;
  debug?: Record<string, number>;
};
