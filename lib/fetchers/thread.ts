import { ThreadWithResponses } from "@/types";
import { callApi } from "../utils";

export const getThreads = async () => {
  const resp = await callApi<{
    userId: string;
    threads: ThreadWithResponses[];
  }>("/api/thread/random");

  if (resp.success) {
    return resp.data;
  } else {
    return null;
  }
};
