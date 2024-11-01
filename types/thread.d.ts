import { Thread } from "@prisma/client";
import { TypedEmail } from ".";

export type TypedEmailThread = Omit<Thread, "emails"> & {
  emails: TypedEmail[];
};

export type EmailThreadCreateBody = Omit<
  TypedEmailThread,
  "createdAt" | "updatedAt"
>;

export type GetThreadsResponse = {
  userId: string;
  threads: ThreadWithResponses[];
  hasMore: boolean;
};
