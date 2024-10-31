import { ThreadWithResponses } from "@/types";
import { callApi } from "../utils";

export const getThreads = async () => {
  return (await callApi("/api/thread/random").then((res) => res.json())) as {
    userId: string;
    threads: ThreadWithResponses[];
  };
};
