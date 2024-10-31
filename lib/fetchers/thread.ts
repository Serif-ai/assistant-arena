import { ThreadWithResponses } from "@/types";
import { callApi } from "../utils";

export const getThreads = async () => {
  const resp = await callApi("/api/thread/random");
  if (resp.success) {
    return resp.data as {
      userId: string;
      threads: ThreadWithResponses[];
    };
  } else {
    return null;
  }
};
