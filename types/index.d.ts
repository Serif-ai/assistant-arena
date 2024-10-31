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

export type UploadedMessage = {
  from: string;
  content: string;
};

export type UploadedEmailThread = {
  id: string;
  thread: UploadedMessage[];
  groundTruth: {
    content: string;
  };
};

export type UploadedAIResponse = {
  id: string;
  response: string;
  exampleId: string;
};

export type VoteRequestBody = {
  userId: string;
  threadId: string;
  winnerId: string;
  loserId: string;
  timeToVote: number;
};

interface Thread {
  id: string;
  messages: Array<{
    from: string;
    content: string;
  }>;
}

interface Response {
  id: string;
  content: string;
}

export interface ThreadWithResponses {
  thread: Thread;
  responses: {
    a: Response;
    b: Response;
  };
}
