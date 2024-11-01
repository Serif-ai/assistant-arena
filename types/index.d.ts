import { GroundTruth } from "@prisma/client";

export type TypedGroundTruth = Omit<GroundTruth, "email"> & {
  email: TypedEmail;
};

export type VoteRequestBody = {
  userId: string;
  threadId: string;
  winnerId: string;
  loserId: string;
  timeToVote: number;
};

export interface ThreadWithResponses {
  thread: {
    id: string;
    emails: Array<TypedEmail>;
  };
  responses: {
    a: {
      id: string;
      draft: TypedEmail;
    };
    b: {
      id: string;
      draft: TypedEmail;
    };
  };
}

export type TypedEmail = {
  subject: string;
  from: string;
  to: string;
  cc: string;
  date: string;
  text: string;
};
